import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ForumService } from '../../services/forum.service';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.css'
})
export class ForumComponent implements OnInit {
  posts: any[] = [];
  filteredPosts: any[] = [];
  categories: any[] = [];
  commentsCount = 0;

  selectedPostCategory = '';
  isDropdownOpen = false; // Состояние кастомного меню

  loading = false;
  errorMessage = '';

  newPostTitle = '';
  newPostContent = '';

  selectedCategory = '';
  selectedPost: any = null;
  comments: any[] = [];
  newCommentText = '';

  editingCommentId: number | null = null;
  editCommentText = '';

  searchText = '';

  toastMessage = '';
  toastVisible = false;
  toastType: 'normal' | 'error' | 'success' = 'normal';

  constructor(
    private forumService: ForumService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadForumData();
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectDropdownCategory(categoryId: any): void {
    this.selectedPostCategory = categoryId;
    this.isDropdownOpen = false;
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  onBackClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.closePost();
  }

  showToast(message: string, type: 'normal' | 'error' | 'success' = 'normal'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 2500);
  }

  loadForumData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.forumService.getForumData().subscribe({
      next: ({ posts, comments, categories }) => {
        const postsData = posts.results || posts;
        const commentsData = comments.results || comments;
        const categoriesData = categories.results || categories;

        this.posts = postsData;

        this.categories = categoriesData.map((category: any) => ({
          id: category.id ?? category.name ?? category,
          name: category.name ?? String(category)
        }));

        this.commentsCount = commentsData.length;

        this.filterByCategory(this.selectedCategory);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('FORUM ERROR:', error);
        this.errorMessage = 'Error forum loading ';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterByCategory(categoryName: string): void {
    this.selectedCategory = categoryName;

    this.filteredPosts = this.posts.filter((post) => {
      if (!categoryName) return true;

      const postCategoryName =
        post.category_name ||
        post.category?.name ||
        this.getCategoryNameById(post.category) ||
        '';

      return postCategoryName.trim().toLowerCase() === categoryName.trim().toLowerCase();
    });

    this.cdr.detectChanges();
  }

  getCategoryNameById(categoryId: number | string): string {
    if (!categoryId) return '';
    const found = this.categories.find((category: any) => category.id === categoryId);
    return found ? found.name : '';
  }

  clearCategoryFilter(): void {
    this.selectedCategory = '';
    this.filteredPosts = [...this.posts];
    this.cdr.detectChanges();
  }

  createPost(): void {
    if (!this.authService.isLoggedIn()) {
      this.showToast('Need to login to post', 'error');
      return;
    }

    if (!this.newPostTitle.trim() || !this.newPostContent.trim() || !this.selectedPostCategory) {
      this.showToast('Fill title, content, category', 'error');
      return;
    }

    this.forumService.createPost({
      title: this.newPostTitle,
      content: this.newPostContent,
      category: this.selectedPostCategory
    }).subscribe({
      next: () => {
        this.newPostTitle = '';
        this.newPostContent = '';
        this.selectedPostCategory = '';
        this.showToast('Post submitted', 'success');
        this.loadForumData();
      },
      error: (error) => {
        console.error('CREATE POST ERROR:', error);
        this.showToast('Posting error', 'error');
      }
    });
  }

  likePost(post: any): void {
    if (!this.authService.isLoggedIn()) {
      this.showToast('Need to login to tap "like"', 'error');
      return;
    }

    this.forumService.likePost(post.id).subscribe({
      next: (data) => {
        post.likes_count = data.likes_count;
        post.liked = data.liked;

        if (this.selectedPost && this.selectedPost.id === post.id) {
          this.selectedPost.likes_count = data.likes_count;
          this.selectedPost.liked = data.liked;
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('LIKE ERROR:', error);
        this.showToast('Unable to like', 'error');
      }
    });
  }

  async openPost(post: any): Promise<void> {
    this.selectedPost = post;
    this.newCommentText = '';
    this.editingCommentId = null;
    await this.loadComments(post.id);
  }

  closePost(): void {
    this.selectedPost = null;
    this.comments = [];
    this.newCommentText = '';
    this.editingCommentId = null;
    this.cdr.detectChanges(); 
  }

  loadComments(postId: number): void {
    this.forumService.getCommentsByPost(postId).subscribe({
      next: (data: any) => {
        const allComments = data.results || data;
        this.comments = allComments.filter((comment: any) => comment.post === postId);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('COMMENTS LOAD ERROR:', error);
        this.showToast('Error loading comments', 'error');
      }
    });
  }

  sendComment(): void {
    if (!this.selectedPost) return;

    if (!this.authService.isLoggedIn()) {
      this.showToast('Need to login to comment', 'error');
      return;
    }

    if (!this.newCommentText.trim()) {
      this.showToast('Comment is empty', 'error');
      return;
    }

    this.forumService.createComment({
      post: this.selectedPost.id,
      text: this.newCommentText
    }).subscribe({
      next: () => {
        this.newCommentText = '';
        this.showToast('Comment added', 'success');
        this.loadComments(this.selectedPost.id);
        this.loadForumData();
      },
      error: (error) => {
        console.error('COMMENT ERROR:', error);
        this.showToast('Unable to leave a comment', 'error');
      }
    });
  }

  startEditComment(comment: any): void {
    this.editingCommentId = comment.id;
    this.editCommentText = comment.text;
    this.cdr.detectChanges(); 
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editCommentText = '';
    this.cdr.detectChanges(); 
  }

  saveEditComment(commentId: number): void {
    if (!this.editCommentText.trim()) {
      this.showToast('Comment cannot be empty', 'error');
      return;
    }

    this.forumService.updateComment(commentId, { text: this.editCommentText }).subscribe({
      next: () => {
        this.showToast('Comment updated', 'success');
        this.cancelEdit();
        this.loadComments(this.selectedPost.id);
      },
      error: (err: any) => {
        console.error('EDIT COMMENT ERROR', err);
        this.showToast('Failed to edit comment', 'error');
        this.cdr.detectChanges(); 
      }
    });
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private postsUrl = 'http://127.0.0.1:8000/api/posts/';
  private commentsUrl = 'http://127.0.0.1:8000/api/comments/';
  private categoriesUrl = 'http://127.0.0.1:8000/api/categories/';

  constructor(private http: HttpClient) {}

  getForumData() {
    return forkJoin({
      posts: this.http.get<any>(this.postsUrl),
      comments: this.http.get<any>(this.commentsUrl),
      categories: this.http.get<any>(this.categoriesUrl)
    });
  }

  createPost(data: { title: string; content: string; category: string | number }): Observable<any> {
    return this.http.post(this.postsUrl, data);
  }

  likePost(postId: number): Observable<any> {
    return this.http.post(`${this.postsUrl}${postId}/like/`, {});
  }

  getCommentsByPost(postId: number): Observable<any> {
    return this.http.get(`${this.commentsUrl}?post=${postId}`);
  }

  createComment(data: { post: number; text: string }): Observable<any> {
    return this.http.post(this.commentsUrl, data);
  }
}
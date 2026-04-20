import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private postsUrl = 'http://127.0.0.1:8000/api/posts/';
  private commentsUrl = 'http://127.0.0.1:8000/api/comments/';
  private categoriesUrl = 'http://127.0.0.1:8000/api/categories/';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  getForumData() {
    return forkJoin({
      posts: this.http.get<any>(this.postsUrl),
      comments: this.http.get<any>(this.commentsUrl),
      categories: this.http.get<any>(this.categoriesUrl)
    });
  }

  createPost(data: { title: string; content: string; category: string | number }): Observable<any> {
    return this.http.post(this.postsUrl, data, { headers: this.getAuthHeaders() });
  }

  likePost(postId: number): Observable<any> {
    return this.http.post(`${this.postsUrl}${postId}/like/`, {}, { headers: this.getAuthHeaders() });
  }

  getCommentsByPost(postId: number): Observable<any> {
    return this.http.get(`${this.commentsUrl}?post=${postId}`);
  }

  createComment(data: { post: number; text: string }): Observable<any> {
    return this.http.post(this.commentsUrl, data, { headers: this.getAuthHeaders() });
  }

  updateComment(commentId: number, data: { text: string }): Observable<any> {
    return this.http.patch(`${this.commentsUrl}${commentId}/`, data, { headers: this.getAuthHeaders() });
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.commentsUrl}${commentId}/`, { headers: this.getAuthHeaders() });
  }
}
export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  category?: number;
  category_name?: string;
  submissions_count?: number;
  input_example?: string;
  output_example?: string;
}
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'student' | 'admin';
          profile_picture_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'student' | 'admin';
          profile_picture_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'student' | 'admin';
          profile_picture_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          section_id: string;
          content: string;
          options: string[];
          correct_option: number;
          tags: string[];
          difficulty: 'easy' | 'medium' | 'hard';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          content: string;
          options: string[];
          correct_option: number;
          tags?: string[];
          difficulty?: 'easy' | 'medium' | 'hard';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          content?: string;
          options?: string[];
          correct_option?: number;
          tags?: string[];
          difficulty?: 'easy' | 'medium' | 'hard';
          created_at?: string;
          updated_at?: string;
        };
      };
      exams: {
        Row: {
          id: string;
          name: string;
          description?: string;
          is_published: boolean;
          total_marks: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          is_published?: boolean;
          total_marks?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          is_published?: boolean;
          total_marks?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          exam_id: string;
          name: string;
          time_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          name: string;
          time_limit: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          name?: string;
          time_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          answers: Record<string, any>;
          score: number;
          completed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          answers: Record<string, any>;
          score?: number;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_id?: string;
          answers?: Record<string, any>;
          score?: number;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      rankings: {
        Row: {
          id: string;
          exam_id: string;
          user_id: string;
          rank: number;
          total_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          user_id: string;
          rank: number;
          total_score: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          user_id?: string;
          rank?: number;
          total_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
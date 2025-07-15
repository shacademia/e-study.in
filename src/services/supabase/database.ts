import { supabase } from '@/config/supabase';
import type { Database } from '@/config/supabase';

type Tables = Database['public']['Tables'];
type Question = Tables['questions']['Row'];
type QuestionInsert = Tables['questions']['Insert'];
type QuestionUpdate = Tables['questions']['Update'];
type Exam = Tables['exams']['Row'];
type ExamInsert = Tables['exams']['Insert'];
type ExamUpdate = Tables['exams']['Update'];
type Section = Tables['sections']['Row'];
type SectionInsert = Tables['sections']['Insert'];
type Submission = Tables['submissions']['Row'];
type SubmissionInsert = Tables['submissions']['Insert'];
type Ranking = Tables['rankings']['Row'];
type RankingInsert = Tables['rankings']['Insert'];

// Questions
export const createQuestion = async (question: QuestionInsert): Promise<Question> => {
  const { data, error } = await supabase.
  from('questions').
  insert(question).
  select().
  single();

  if (error) throw error;
  return data;
};

export const getQuestion = async (id: string): Promise<Question> => {
  const { data, error } = await supabase.
  from('questions').
  select('*').
  eq('id', id).
  single();

  if (error) throw error;
  return data;
};

export const getQuestions = async (sectionId?: string): Promise<Question[]> => {
  let query = supabase.from('questions').select('*');

  if (sectionId) {
    query = query.eq('section_id', sectionId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const updateQuestion = async (id: string, updates: QuestionUpdate): Promise<Question> => {
  const { data, error } = await supabase.
  from('questions').
  update(updates).
  eq('id', id).
  select().
  single();

  if (error) throw error;
  return data;
};

export const deleteQuestion = async (id: string): Promise<void> => {
  const { error } = await supabase.
  from('questions').
  delete().
  eq('id', id);

  if (error) throw error;
};

// Exams
export const createExam = async (exam: ExamInsert): Promise<Exam> => {
  const { data, error } = await supabase.
  from('exams').
  insert(exam).
  select().
  single();

  if (error) throw error;
  return data;
};

export const getExam = async (id: string): Promise<Exam> => {
  const { data, error } = await supabase.
  from('exams').
  select('*').
  eq('id', id).
  single();

  if (error) throw error;
  return data;
};

export const getExams = async (publishedOnly = false): Promise<Exam[]> => {
  let query = supabase.from('exams').select('*');

  if (publishedOnly) {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const updateExam = async (id: string, updates: ExamUpdate): Promise<Exam> => {
  const { data, error } = await supabase.
  from('exams').
  update(updates).
  eq('id', id).
  select().
  single();

  if (error) throw error;
  return data;
};

export const deleteExam = async (id: string): Promise<void> => {
  const { error } = await supabase.
  from('exams').
  delete().
  eq('id', id);

  if (error) throw error;
};

// Sections
export const createSection = async (section: SectionInsert): Promise<Section> => {
  const { data, error } = await supabase.
  from('sections').
  insert(section).
  select().
  single();

  if (error) throw error;
  return data;
};

export const getSections = async (examId: string): Promise<Section[]> => {
  const { data, error } = await supabase.
  from('sections').
  select('*').
  eq('exam_id', examId);

  if (error) throw error;
  return data || [];
};

// Submissions
export const createSubmission = async (submission: SubmissionInsert): Promise<Submission> => {
  const { data, error } = await supabase.
  from('submissions').
  insert(submission).
  select().
  single();

  if (error) throw error;
  return data;
};

export const getSubmission = async (id: string): Promise<Submission> => {
  const { data, error } = await supabase.
  from('submissions').
  select('*').
  eq('id', id).
  single();

  if (error) throw error;
  return data;
};

export const getUserSubmissions = async (userId: string): Promise<Submission[]> => {
  const { data, error } = await supabase.
  from('submissions').
  select('*').
  eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

export const getExamSubmissions = async (examId: string): Promise<Submission[]> => {
  const { data, error } = await supabase.
  from('submissions').
  select('*').
  eq('exam_id', examId);

  if (error) throw error;
  return data || [];
};

export const updateSubmission = async (id: string, updates: Partial<Submission>): Promise<Submission> => {
  const { data, error } = await supabase.
  from('submissions').
  update(updates).
  eq('id', id).
  select().
  single();

  if (error) throw error;
  return data;
};

// Rankings
export const createRanking = async (ranking: RankingInsert): Promise<Ranking> => {
  const { data, error } = await supabase.
  from('rankings').
  insert(ranking).
  select().
  single();

  if (error) throw error;
  return data;
};

export const getRankings = async (examId: string): Promise<Ranking[]> => {
  const { data, error } = await supabase.
  from('rankings').
  select(`
      *,
      users:user_id (
        name,
        email
      )
    `).
  eq('exam_id', examId).
  order('rank', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getUserRank = async (userId: string, examId: string): Promise<Ranking | null> => {
  const { data, error } = await supabase.
  from('rankings').
  select('*').
  eq('user_id', userId).
  eq('exam_id', examId).
  single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Calculate rankings for an exam
export const calculateRankings = async (examId: string): Promise<void> => {
  // Get all submissions for this exam
  const submissions = await getExamSubmissions(examId);

  // Sort by score (descending)
  const sortedSubmissions = submissions.sort((a, b) => b.score - a.score);

  // Delete existing rankings
  await supabase.
  from('rankings').
  delete().
  eq('exam_id', examId);

  // Create new rankings
  const rankings: RankingInsert[] = sortedSubmissions.map((submission, index) => ({
    exam_id: examId,
    user_id: submission.user_id,
    rank: index + 1,
    total_score: submission.score
  }));

  if (rankings.length > 0) {
    const { error } = await supabase.
    from('rankings').
    insert(rankings);

    if (error) throw error;
  }
};
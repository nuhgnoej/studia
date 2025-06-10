// lib/loadDummy.ts
import questions from '../assets/dummy-questions.json';
import { insertQuestions } from './db';

export async function loadDummyQuestions() {
  await insertQuestions(questions);
}
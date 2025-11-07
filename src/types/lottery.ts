export interface Student {
  id: string;
  name: string;
  studentId: string;
  selectedCount: number; // 背诵数
  passCount: number; // 成功数
}

export interface Class {
  id: string;
  name: string;
  students: Student[];
}

export interface Passage {
  id: string;
  classId: string;
  title: string;
  author?: string;
  content?: string;
}

export interface PassageStat {
  studentId: string;
  passageId: string;
  selectedCount: number;
  passCount: number;
}


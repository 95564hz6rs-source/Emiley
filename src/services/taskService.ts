import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Priority, TaskItem } from '../types';

export function subscribeToUserTasks(
  userId: string,
  onTasksChanged: (tasks: TaskItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const collectionPath = `users/${userId}/tasks`;
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: TaskItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let createdIso = new Date().toISOString();
        let updatedIso = new Date().toISOString();

        if (data.createdAt?.toDate) {
          createdIso = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdIso = data.createdAt;
        }

        if (data.updatedAt?.toDate) {
          updatedIso = data.updatedAt.toDate().toISOString();
        } else if (typeof data.updatedAt === 'string') {
          updatedIso = data.updatedAt;
        }

        tasks.push({
          id: docSnap.id,
          title: data.title || '',
          completed: Boolean(data.completed),
          userId: data.userId || userId,
          category: data.category,
          priority: data.priority as Priority | undefined,
          createdAt: createdIso,
          updatedAt: updatedIso,
        });
      });
      onTasksChanged(tasks);
    },
    (error) => {
      if (onError) {
        try {
          handleFirestoreError(error, OperationType.LIST, collectionPath);
        } catch (wrapped) {
          onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      } else {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      }
    }
  );
}

export async function createFirestoreTask(
  userId: string,
  task: {
    id?: string;
    title: string;
    category?: string;
    priority?: Priority;
  }
): Promise<string> {
  const tasksCol = collection(db, 'users', userId, 'tasks');
  const taskDoc = task.id ? doc(tasksCol, task.id) : doc(tasksCol);
  const docPath = `users/${userId}/tasks/${taskDoc.id}`;

  const payload: Record<string, any> = {
    title: task.title.trim().slice(0, 300),
    completed: false,
    userId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (task.category && task.category.trim()) {
    payload.category = task.category.trim().slice(0, 50);
  }
  if (task.priority) {
    payload.priority = task.priority;
  }

  try {
    await setDoc(taskDoc, payload);
    return taskDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function updateFirestoreTask(
  userId: string,
  taskId: string,
  updates: Partial<Pick<TaskItem, 'title' | 'completed' | 'category' | 'priority'>>
): Promise<void> {
  const docPath = `users/${userId}/tasks/${taskId}`;
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);

  const payload: Record<string, any> = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  if (payload.title !== undefined) {
    payload.title = payload.title.trim().slice(0, 300);
  }
  if (payload.category !== undefined && payload.category !== '') {
    payload.category = payload.category.trim().slice(0, 50);
  }

  try {
    await updateDoc(taskRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteFirestoreTask(userId: string, taskId: string): Promise<void> {
  const docPath = `users/${userId}/tasks/${taskId}`;
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);

  try {
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

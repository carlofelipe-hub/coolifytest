'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Note {
  id: number;
  content: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetch('/api/notes')
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
          throw new Error(errorData.error || `An error occurred: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setNotes(data);
        } else {
          throw new Error('Invalid data format received from server');
        }
      })
      .catch(err => {
        setError(err.message);
        console.error(err);
        setNotes([]);
      });
  }, []);

  const createNote = () => {
    fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
          throw new Error(errorData.error || `An error occurred: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.id) {
          setNotes([...notes, data]);
          setNewNote('');
          setError(null);
        } else {
          throw new Error('Invalid data format received from server');
        }
      })
      .catch(err => {
        setError(err.message);
        console.error(err);
      });
  };

  const updateNote = (id: number, content: string) => {
    fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
          throw new Error(errorData.error || `An error occurred: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.id) {
          setNotes(notes.map(note => note.id === id ? data : note));
          setEditingNote(null);
          setError(null);
        } else {
          throw new Error('Invalid data format received from server');
        }
      })
      .catch(err => {
        setError(err.message);
        console.error(err);
      });
  };

  const deleteNote = (id: number) => {
    fetch(`/api/notes/${id}`, {
      method: 'DELETE',
    }).then((res) => {
        if(res.ok) {
            setNotes(notes.filter((note) => note.id !== id));
            setError(null);
        } else {
            throw new Error('Failed to delete note');
        }
    }).catch(err => {
        setError(err.message);
        console.error(err);
    });
  };

  return (
    <div className="min-h-screen bg-secondary dark:bg-primary">
      <header className="flex justify-between items-center p-4 bg-white dark:bg-accent shadow-md">
        <h1 className="text-2xl font-bold text-primary dark:text-secondary">Coolify Notes</h1>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <img src={isDarkMode ? '/window.svg' : '/file.svg'} alt="Toggle Dark Mode" className="w-6 h-6" />
        </button>
      </header>

      <main className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-accent p-4 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-bold mb-2 text-primary dark:text-secondary">{editingNote ? 'Edit Note' : 'Create Note'}</h2>
            <textarea
              value={editingNote ? editingNote.content : newNote}
              onChange={(e) => editingNote ? setEditingNote({ ...editingNote, content: e.target.value }) : setNewNote(e.target.value)}
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800 text-primary dark:text-secondary mb-2"
              placeholder="Enter your note (Markdown supported)"
              rows={4}
            />
            <div className="flex justify-end">
              {editingNote ? (
                <>
                  <button onClick={() => setEditingNote(null)} className="bg-gray-500 text-white p-2 rounded mr-2">Cancel</button>
                  <button onClick={() => updateNote(editingNote.id, editingNote.content)} className="bg-blue-500 text-white p-2 rounded">Update</button>
                </>
              ) : (
                <button onClick={createNote} className="bg-blue-500 text-white p-2 rounded">Add Note</button>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 bg-red-100 p-2 mb-4 rounded">{error}</p>}

          <div className="grid gap-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white dark:bg-accent p-4 rounded-lg shadow-md">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={() => setEditingNote(note)} className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</button>
                  <button onClick={() => deleteNote(note.id)} className="bg-red-500 text-white p-2 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center p-4 text-gray-500 dark:text-gray-400">
        <p>Powered by <a href="https://coolify.io" target="_blank" rel="noopener noreferrer" className="underline">Coolify</a></p>
      </footer>
    </div>
  );
}
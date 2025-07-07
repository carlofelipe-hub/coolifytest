'use client';

import { useState, useEffect } from 'react';

interface Note {
  id: number;
  content: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notes</h1>
      {error && <p className="text-red-500 bg-red-100 p-2 mb-4">{error}</p>}
      <div className="flex mb-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="border p-2 flex-grow"
          placeholder="Enter a new note"
        />
        <button onClick={createNote} className="bg-blue-500 text-white p-2 ml-2">
          Add Note
        </button>
      </div>
      <ul>
        {Array.isArray(notes) && notes.map((note) => (
          <li key={note.id} className="flex justify-between items-center border-b p-2">
            <span>{note.content}</span>
            <button onClick={() => deleteNote(note.id)} className="bg-red-500 text-white p-1">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

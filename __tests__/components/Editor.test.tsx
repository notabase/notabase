import { render, screen, act } from '@testing-library/react';
import Editor from 'components/editor/Editor';
import { store } from 'lib/store';
import { AuthContext } from 'utils/useAuth';
import notes from '__fixtures__/notes';

describe('Editor', () => {
  const renderEditor = () => {
    const auth = {
      isLoaded: true,
      user: {
        id: '1',
        app_metadata: {},
        user_metadata: {},
        aud: '',
        created_at: new Date().toISOString(),
      },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    };
    const firstNoteId = Object.keys(store.getState().notes)[0];
    return render(
      <AuthContext.Provider value={auth}>
        <Editor noteId={firstNoteId} onChange={jest.fn()} />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();

    act(() => {
      store.getState().setNotes(notes);
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders editor and placeholder', () => {
    renderEditor();

    const editor = screen.getByRole('textbox');
    expect(editor).toBeInTheDocument();

    act(() => jest.runAllTimers());

    const placeholder = screen.getByText('Start typing here…');
    expect(placeholder).toBeInTheDocument();
  });
});

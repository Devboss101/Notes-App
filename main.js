

class NoteStorage {
    
    static get_all_notes () {
        const stored_notes = JSON.parse(localStorage.getItem('notes') || "[]")

        return stored_notes.sort((a, b) => {
            return new Date (a.updated) > new Date (b.updated) ? -1 : 1
        })

    }

    static save_notes__(note_to_be_saved) {
        const stored_notes = NoteStorage.get_all_notes()
        const existing = stored_notes.find(note =>  note.id == note_to_be_saved.id)

        if (existing) {
            existing.title = note_to_be_saved.title
            existing.body = note_to_be_saved.body
            existing.updated = new Date().toISOString()
        } else {
            note_to_be_saved.updated = new Date().toISOString()
            note_to_be_saved.id = Math.floor(Math.random() * 1000000)

            stored_notes.push(note_to_be_saved)
        }


        
        localStorage.setItem('notes', JSON.stringify(stored_notes))
    }

    static removeNotes(id) {
        const notes = NoteStorage.get_all_notes()
        const filtered_notes = notes.filter(note => id != note.id)
        
        localStorage.setItem('notes', JSON.stringify(filtered_notes))
    }

}

// NoteStorage.removeNotes({
//     title: "Working perfectly",
//     body: "I am remodifying this code to fit my own preferences, *body, I am remodifying this code to fit my own preferences, *body, I am remodifying this code to fit my own preferences, *body, I am remodifying this code to fit my own preferences, *body",
//     id: 602097
// })





class NotesUI {
    constructor (root, {note_add, note_delete, note_selected, note_edit} = {}) {
        this.root = root,
        this.note_add = note_add,
        this.note_delete = note_delete,
        this.note_selected = note_selected,
        this.note_edit = note_edit

        this.root.innerHTML = `
            <aside>

            <header>
                <h1 id="title">Notes</h1>

                <button class="add_btn">Add Notes</button>
            </header>

            <div class="main_overview">

                <ul class="note_list_wrapper">
                    
                </ul>

            </div>

            </aside>

            <div class="main">
                <input type="text" placeholder="Note Title..." id="inpTitle" class="inpTitle">
                <textarea name="body" id="inpBody" class="inpBody">Take Note...</textarea>
            </div> 
        `

        this.root.querySelector('.add_btn').addEventListener('click', () => {
            this.note_add()
        })
        
        
        const inpTitle = this.root.querySelector('.inpTitle')
        const inpBody = this.root.querySelector('.inpBody')

        const inputFields = [inpTitle, inpBody]

        inputFields.forEach(input => {
            input.addEventListener('blur', () => {
                this.note_edit(inpTitle.value.trim(), inpBody.value.trim())
            })
        })

    }

    _createHTML_STRING(title, body, updated, id){

        const STRING_LENGTH = 60;
         
        return `
                <li class="note_list_item" data-note-id=${id}>

                    <h4 class="title_output">${title}</h4>
                    <p class="body_output">
                        ${body.substring(0, STRING_LENGTH)}
                        ${body.length > STRING_LENGTH ? "..." : ""}
                    </p>
                    <div class="date_container">
                        <p>${updated.toLocaleString(undefined, {dateStyle: 'full', timeStyle: 'short'})}</p>
                    </div>
                        

                 </li>
            `

    }

    update_note_list(notes) {
        const note_list_wrapper = this.root.querySelector(".note_list_wrapper")
        note_list_wrapper.innerHTML = ""

        for (const note of notes) {
            const html = this._createHTML_STRING(note.title, note.body, new Date(note.updated), note.id)

            note_list_wrapper.insertAdjacentHTML('beforeend', html)
        }

        note_list_wrapper.querySelectorAll(".note_list_item").forEach(item => {
            item.addEventListener('click', () => {
                this.note_selected(item.dataset.noteId)
            })

        

            item.addEventListener('dblclick', () => {
                const isValid = confirm("Are you sure you want to delete this note?")

                if (isValid) {
                    this.note_delete(item.dataset.noteId)
                }
                
            })
        });

    }

    update_active_note (note) {
        this.root.querySelector('.inpTitle').value = note.title
        this.root.querySelector('.inpBody').value = note.body

        this.root.querySelectorAll(".note_list_item").forEach(item => {
            item.classList.remove("active")
        })

        this.root.querySelector(`.note_list_item[data-note-id="${note.id}"]`).classList.add("active")
    }

    update_page_visibility(notes) {
        const note_list_wrapper = this.root.querySelector(".note_list_wrapper")
        
        if (!(notes.length > 0)) {
            note_list_wrapper.innerHTML = `
                <p class="empty_para">No notes available</p>
                <button class="add_btn main_btn">Add Notes</button>
            `

            note_list_wrapper.querySelector(".main_btn").addEventListener('click', () => {
                this.note_add()
            })

            note_list_wrapper.classList.add('empty_wrapper')
            this.root.querySelector('.main').classList.add('visibility')
        } else {
            note_list_wrapper.classList.remove('empty_wrapper')
            this.root.querySelector('.main').classList.remove('visibility')
        }
    }

    
}

class Functionalities {
    constructor (app) {
        this.notes = []
        this.app = app
        this.ui = new NotesUI(this.app, this._binders())
        this.activeNote = null;

        this._refresh();

        this.ui.update_page_visibility(this.notes)
    }

    _refresh() {
        const notes = NoteStorage.get_all_notes()

        this._setNotes(notes)

        if (notes.length > 0) {
            this._setActivate(notes[0])
        }
        
        this.ui.update_page_visibility(notes)

    }

    _setNotes(notes){
        this.notes = notes,
        this.ui.update_note_list(notes)
    }

    _setActivate(note) {
        this.activeNote = note
        this.ui.update_active_note(note)
    }

    _binders() {

        return {
            note_add: () => {
                const newNote = {
                    title: "New Note",
                    body: "Take Note..."
                }

                NoteStorage.save_notes__(newNote)

                this._refresh()
            },
            note_selected: (id) => {
                const selectedNote = this.notes.find(note => note.id == id)
                
                this._setActivate(selectedNote)
            },
            note_edit: (updatedTitle, updatedBody) => {
                NoteStorage.save_notes__({
                    title: updatedTitle,
                    body: updatedBody,
                    id: this.activeNote.id
                })

                this._refresh()
            },
            note_delete: id => {
                NoteStorage.removeNotes(id)

                this._refresh()
            }
        }
    }

    
}

const wrapper = document.querySelector('.wrapper')
const func = new Functionalities(wrapper)



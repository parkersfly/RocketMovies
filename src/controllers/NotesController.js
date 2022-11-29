const AppError = require("../utils/AppError");
const knex = require("../database/knex");

class NotesController {
    async create(request, response){
        const { title, description, rating, tags } = request.body;
        const { user_id } = request.params;

        if(Number(rating) > 5 || Number(rating) < 1){
            throw new AppError("Insira uma pontuação de 1 a 5");
        }

        const note_id = await knex("movieNotes").insert({
            title,
            description,
            rating,
            user_id
        });

        const tagsInsert = tags.map( name => {
            return {
                note_id,
                name,
                user_id
            }
        });

        await knex("movieTags").insert(tagsInsert);

        response.json();
    }
    
    async show(request, response){
        const { id } = request.params;

        const note = await knex("movieNotes").where({ id });
        const tags = await knex("movieTags").where({ note_id: id}).orderBy("name");

        return response.json({
            ...note,
            tags
        });
    }
   
    async delete(request, response){
        const { id} = request.params;

        await knex("movieNotes").where({id}).delete();

        return response.json({
            "message": "Nota deletada com sucesso!"
        });
    }

    async index(request, response){
        const { user_id, title, tags } = request.query;

        let notes;

        if(tags){
            const filterTags = tags.split(',').map(tag => tag.trim())

            notes = await knex("movieTags")
            .select([
                "movieNotes.id",
                "movieNotes.title",
                "movieNotes.user_id",
            ])
            .where("movieNotes.user_id", user_id)
            .whereLike("movieNotes.title", `%${title}%`)
            .whereIn("name", filterTags)
            .innerJoin("movieNotes", "movieNotes.id", "movieTags.note_id")
            .orderBy("movieNotes.title")

        } else {
            notes = await knex("movieNotes")
            .where({user_id})
            .whereLike("title", `%${title}%`)
            .orderBy("title");
        }

        const filterTags = await knex("movieTags").where({user_id})
        const notesWithTags = notes.map( note => {
            const noteTags = filterTags.filter( tag => tags.note_id === notes.id);

            return {
                ...note,
                tags: noteTags
            }
        })

       return response.json(notesWithTags);
    }
}

module.exports = NotesController;
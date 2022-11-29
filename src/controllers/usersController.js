const { hash, compare } = require("bcryptjs")
const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");
const knex = require("../database/knex");

class UsersController {
    async create(request, response){
        const { name, email, password } = request.body;

        const database = await sqliteConnection();
        const checkIfEmailExists = await database.get("SELECT * FROM movieUsers WHERE email = (?)", [email]);

        if(checkIfEmailExists){
            throw new AppError("Este email já está em uso!");
        }

        const hashedPassword = await hash(password, 8);

        await database.run("INSERT INTO movieUsers (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

        return response.json({
            "message": "Usuário cadastrado com sucesso!"
        });
    }

    async update(request, response){
        const { name, email, password, old_password } = request.body;
        const { id } = request.params;

        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM movieUsers WHERE id = ?", [id]);

        if(!user){
            throw new AppError("Usuário não cadastrado!");
        }

        const checkEmailIsUsed = await database.get("SELECT * FROM movieUsers WHERE email = ?", [email]);

        if(checkEmailIsUsed && checkEmailIsUsed.id !== user.id){
            throw new AppError("Este email já está sendo utilizado!");
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;

        if(password && !old_password){
            throw new AppError("Digite a senha antiga!");
        }

        if(password && old_password){
            const checkOldPassword = await compare(old_password, user.password);

            if(!checkOldPassword){
                throw new AppError("A senha antiga não confere!")
            }

            user.password = await hash(password, 8);
        }

        await database.run("UPDATE movieUsers SET name = ?, email = ?, password = ?, updated_at = DATETIME('now') WHERE id = ?", [user.name, user.email, user.password, id]);

        return response.json("Atualizado com sucesso!");
    }

    async delete(request, response){
        const { id } = request.params;

        await knex("movieUsers").where({id}).delete();

        return response.json({
            "message": "usuário deletado com sucesso!"
        });
    }
}

module.exports = UsersController;
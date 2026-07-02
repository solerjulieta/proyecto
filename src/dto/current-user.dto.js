export class CurrentUserDTO{
    constructor(user){
        //Controla qué datos salen por la API
        this.id = user._id || user.id
        this.first_name = user.first_name
        this.last_name = user.last_name 
        this.email = user.email
        this.role = user.role
    }
}
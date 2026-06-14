import { userRepository } from '../repositories/user.repository.js'
import { hashPassword } from '../utils/hash.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export const registerUser = async ({ first_name, last_name, email, password }) => 
{
    //Valido campos requeridos
    if(!first_name || !last_name || !email || !password){
        throw { status: 400, message: 'Todos los campos son obligatorios.' }
    }

    //Validación de formato de email
    if(!EMAIL_REGEX.test(email)){
        throw { status: 400, message: 'El formato del email es inválido.' }
    }

    //Validación de longitud de contraseña
    if(password.length < MIN_PASSWORD_LENGTH){
        throw { status: 400, message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` }
    }

    //Normalización del email
    const normalizedEmail = email.trim().toLowerCase()

    //Verifico si el email ya existe
    const existingUser = await userRepository.findByEmail(normalizedEmail)
    if(existingUser){
        throw { status: 409, message: 'Ya existe un usuario registrado con este email.' }
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password)

    // Creo el usuario, siempre el rol es user
    const newUser = await userRepository.create({
        first_name,
        last_name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user'
    })

    return{
        _id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role
    }
}
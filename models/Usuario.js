const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const Usuario = db.define('usuario',{
    codUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING(80),
        allowNull: false
    },
    nome_completo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    senha: { // Campo para armazenar a hash da senha
        type: DataTypes.STRING(255),
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    cpf: {
        type: DataTypes.STRING(14), // Campo para CPF '123.456.789-55'
        allowNull: false,
        unique: true
    },
    identidade: {
        type: DataTypes.STRING(20), // Campo para Identidade (RG ou outro documento)
        allowNull: true, // Permitindo NULL, já que CPF é obrigatório
    },
    tipo_usuario: {
        type: DataTypes.ENUM('CLIENTE', 'ADMIN'),
        allowNull: false,
    }
},{
    timestamps: true, 
    tableName: 'usuarios'
})

module.exports = Usuario
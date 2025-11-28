const conn = require('./db/conn') 

const { 
    Usuario, 
    Pedido, 
    Produto, 
    ItemPedido, 
    Entrega, 
    Endereco, 
    Estoque 
} = require('./models/rel') 

async function syncDataBase(){
    try{
        // Usando { alter: true } para fazer alterações no banco sem perder dados
        await conn.sync({ alter: true })

        console.log('-----------------------------')
        console.log('Banco de Dados sincronizado !')
        console.log('-----------------------------')

        // Seed products if none exist
        const { Produto, Estoque } = require('./models/rel')

        const productCount = await Produto.count()
        if (productCount === 0) {
            console.log('Criando produtos de exemplo...')

            const produtos = [
                {
                    nome: 'BMW S1000RR',
                    descricao: 'Superbike alemã com motor 4 cilindros em linha de 999cc, 207 HP e 113 Nm de torque. Equipada com ABS, controle de tração, quickshifter e suspensão ajustável. Peso: 197kg.',
                    modelo: 'S1000RR',
                    preco: 82000.00,
                    imagem_url: '/frontend/images/bmws1000rr.png',
                    ativo: true
                },
                {
                    nome: 'Ducati Diavel V4',
                    descricao: 'Power cruiser italiana com motor V4 Granturismo de 1158cc, 168 HP e 127 Nm de torque. Design agressivo, suspensão ajustável e freios Brembo. Peso: 218kg.',
                    modelo: 'Diavel V4',
                    preco: 95000.00,
                    imagem_url: '/frontend/images/DucatiDiavel.png',
                    ativo: true
                },
                {
                    nome: 'Ducati Panigale V4S',
                    descricao: 'Superbike italiana com motor V4 de 1103cc, 214 HP e 124 Nm de torque. Equipada com winglets aerodinâmicos, Öhlins ajustável e quickshifter. Peso: 198kg.',
                    modelo: 'Panigale V4S',
                    preco: 125000.00,
                    imagem_url: '/frontend/images/ducativ4s.png',
                    ativo: true
                },
                {
                    nome: 'Kawasaki Ninja H2R',
                    descricao: 'Hyperbike japonesa com motor 4 cilindros supercharged de 998cc, 310 HP e 165 Nm de torque. Aceleração de 0-100km/h em 2.5s. Peso: 216kg.',
                    modelo: 'Ninja H2R',
                    preco: 135000.00,
                    imagem_url: '/frontend/images/h2r.png',
                    ativo: true
                },
                {
                    nome: 'Kawasaki Z1000',
                    descricao: 'Naked sport japonesa com motor 4 cilindros em linha de 1043cc, 142 HP e 111 Nm de torque. Equipada com ABS, controle de tração e quickshifter. Peso: 221kg.',
                    modelo: 'Z1000',
                    preco: 78000.00,
                    imagem_url: '/frontend/images/z1000.png',
                    ativo: true
                }
            ]

            for (const prodData of produtos) {
                const produto = await Produto.create(prodData)
                await Estoque.create({
                    idProduto: produto.codProduto,
                    quantidade_atual: 10,
                    quantidade_minima: 2
                })
            }

            console.log('Produtos de exemplo criados com sucesso!')

            // Create admin user if none exists
            const adminCount = await Usuario.count({ where: { tipo_usuario: 'ADMIN' } })
            if (adminCount === 0) {
                console.log('Criando usuário administrador...')

                const bcrypt = require('bcrypt')
                const adminPassword = await bcrypt.hash('admin123', 10)

                await Usuario.create({
                    nome: 'admin',
                    nome_completo: 'Administrador do Sistema',
                    email: 'admin@motostore.com',
                    senha: adminPassword,
                    telefone: '(11) 99999-9999',
                    cpf: '00000000000',
                    tipo_usuario: 'ADMIN'
                })

                console.log('Usuário administrador criado!')
                console.log('Email: admin@motostore.com')
                console.log('Senha: admin123')
            }
        }

    }catch(err){
        console.error(' ERRO: Não foi possível sincronizar o banco de dados!', err)
    } finally {
        await conn.close()
        console.log('Conexão com o banco de dados fechada.')
    }
}

// Chamar a função para sincronizar o banco de dados
syncDataBase()
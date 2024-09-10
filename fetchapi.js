// Adicionar um ouvinte de evento quando o botão for clicado
// Quando meu botao for clicado, uma funcao fetchPets sera chamada
document.getElementById('fetchPetsButton').addEventListener('click', fetchPets);

// Função que busca a lista de pets do servidor
function fetchPets(){
    // Faz uma req para o endpoint /pets do nosso servidor local
    fetch('http://localhost:8000/pets')
        .then( response => {
            //Verificar se a resposta da req é bem sucedida
            if(!response.ok){
                // Se nao for, lance uma exception com o erro 
                throw new Error('Erro na resposta ' + response.statusText);
            }

            return response.json()
        })
        .then( pets => {
            const petsList = document.getElementById('petsList');
            petsList.innerHTML = '';

            //Verifica se há pets na lista retornada
            if(pets.length > 0){
                pets.forEach(pet => {
                    const petElement = document.createElement('div');
                    petElement.classList.add('pet');
                    petElement.textContent = `ID: ${pet.id}, Nome: ${pet.name}, Idade: ${pet.age}, Tipo: ${pet.type}, Dono: ${pet.owner}`;
                    petsList.appendChild(petElement);
                });

            }else{
                //se não houver pets, exibe essa mensagem
                petsList.textContent = 'Nenhum pet foi encontrado.'
            }
        })
        .catch(error => {
            document.getElementById('petsList').textContent = 'Falha ao buscar pets.'
        })


}
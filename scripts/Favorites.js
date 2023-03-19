import { GithubUser } from "./GithubUser.js"
// Classe que vai conter a lógica
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)

    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@gitfav:')) || []
  }

  save() {
    localStorage.setItem('@gitfav:', JSON.stringify(this.entries))
  }

  async add(username) {
    try  {
      const userExists = this.entries.find( entry => entry.login === username )

      if(userExists){
        throw new Error('Usuário já cadastrado!')
      }

      const user = await GithubUser.search(username)

      console.log(user)

      if(user.login === undefined) {
        throw new Error ('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) { 
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

// Classe que cria a visualização do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')


    this.update()
    this.onAdd()

  }

  onAdd () {
    const addButton = this.root.querySelector('#search')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('#github-search')
      this.add(value)
    }
  }

  noFavorite() {
    const noFavoriteAdd = this.entries.length == 0 

    if(noFavoriteAdd) {
      document.querySelector('.doesnt-have-favorites').classList.remove('hide')
      document.querySelector('.favorites').classList.add('hide')
    } else {
      document.querySelector('.favorites').classList.remove('hide')
      document.querySelector('.doesnt-have-favorites').classList.add('hide')
    }
  }

  update() {
    this.removeAllTr()
    this.noFavorite()

    this.root.querySelector('#github-search').value =''

    this.entries.forEach( (user) => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      row.querySelector('.user a').href = `https://github.com/${user.login}`

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja remover esta linha?')

        if(isOk) { 
          this.delete(user)
        }
      }

      this.tbody.append(row)

    })

  }

  createRow() {

    const tr = document.createElement('tr')

    tr.innerHTML = 
    `
      <tr>
        <td class="user">
          <img src="" alt="" />
          <a href="" target="_blank">
            <p></p>
            <span></span>
          </a>
        </td>
        <td class="repositories"></td>
        <td class="followers"></td>
        <td class="action">
          <button class="remove">Remover</button>
        </td>
      </tr>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach( (tr) => {
      tr.remove()
    })
  }


}
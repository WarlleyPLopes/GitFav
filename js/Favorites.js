export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    return fetch(endpoint)
      .then((data) => data.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        repositories: public_repos,
        followers,
      }));
  }
}

//classe que vai conter a lógica dos dados
//como os dados serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username){
    try {
        const userExists = this.entries.find(entry => entry.login === username) 

        if(userExists) {
            throw new Error('Usuário já existe na lista!')
        }

        const user = await GithubUser.search(username)
        if(user.login === undefined) {
            throw new Error('Usuário não encontrado!')
        }

        this.entries = [user, ...this.entries]
        this.update()
        this.save()

    } catch (error) {
        alert(error.message)
        return
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );
    this.entries = filteredEntries;
    this.update();
    this.save()
  }
}

//classe que vai criar a vizualização e o evento do html
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector("table tbody");
    
    this.update();
    this.onadd()
  }

  onadd(){
    const addButton = this.root.querySelector('.search button')

    addButton.onclick = () => {
        const value = this.root.querySelector('.search input').value
        this.add(value)
    }

  }

  update() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();
      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.repositories;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certeza que deseja deletar esse usuário?");
        if (isOk) {
          this.delete(user);
        }
      };
      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td class="user">
        <img src="https://github.com/WarlleyPLopes.png" alt="Imagem de Warlley Lopes">
        <a href="https://github.com/WarlleyPLopes" target="_blank">
            <p>Warlley Lopes</p>
            <span>WarlleyPLopes</span>
        </a>
    </td>
    <td class="repositories">29</td>
    <td class="followers">3</td>
    <td>
      <button class="remove">Remover</button>
    </td>
  `;
    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => tr.remove());
  }
}

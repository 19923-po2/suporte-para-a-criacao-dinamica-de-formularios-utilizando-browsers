# suporte-para-a-criacao-dinamica-de-formularios-utilizando-browsers

Caso queira executar este programa localmente ao invés do website hospedado no github pages, terá que clonar o projeto do repositório. Após abrir o projeto num IDE como o Visual Studio Code, terá que executar o comando "ng serve --open" no terminal para executar a aplicação web deste projeto Angular. Ao executar este comando será aberta uma janela no seu browser com o url http://localhost:4200/ que apresenta a interface do formulário.

Caso queira alterar o formulário, terá que editar o código do ficheiro src/app/form/form.component.ts, no método ngOnInit() da classe FormComponent. O primeiro passo é criar um objeto Form, neste objeto pode chamar o método addLabelInput() para criar um grupo com uma label e um input, o método addList() para adicionar uma list e o método show() para mostrar o formulário na interface. 

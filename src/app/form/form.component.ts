import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})

export class FormComponent implements OnInit {
  
  constructor() {

  }

  ngOnInit(): void {
    const ucForm = new Form("Planeamento da Unidades Curricular"); // Title
    ucForm.addLabelInputGroup("Nome da UC"); // Title
    const list = ucForm.addList("Conteúdos"); // Title
    ucForm.addList("Objetivos","Os conteúdos importantes são: ", list); // Title, Prefixo
    ucForm.show(); // Show
  }  
}

/**************************************************************/ 

export class Form {
  id : string;
  title: string;
  contents: (List | LabelInputGroup)[];

  constructor(title: string) {
    this.id = "form";
    this.title = title;
    this.contents = [];
  }
  
  addLabelInputGroup(title: string): LabelInputGroup{
    const id = "content" + (this.contents.length + 1);
    const inputId = id + "Input";
    const labelInputGroup = new LabelInputGroup(id, new Label(title, inputId), new Input(inputId, "text"));
    this.contents.push(labelInputGroup);
    return labelInputGroup;
  }

  addList(title: string, prefix?: string, referenceList? : List): List{
    const id = "content" + (this.contents.length + 1);
    const list = new List(id, title , prefix, referenceList);
    this.contents.push(list);
    return list;
  }
  
  show(){
    const formHtml = this.html(); 
    document.getElementById("main")!.appendChild(this.html());
  }

  update(){ 
    document.getElementById("main")!.innerHTML = "";
    this.show();
  }

  // https://stackoverflow.com/questions/34504050/how-to-convert-selected-html-to-json
  downloadJsonFile(fileName: string, text: string) {
    var element = document.createElement('a');
    const fileType = fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

  downloadTxtFile(fileName: string, text: string){
    var element = document.createElement('a');
    const fileType = fileName.indexOf('.txt') > -1 ? 'text/txt' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', fileName);
    var event = new MouseEvent("click");
    element.dispatchEvent(event);
    
  }

  // https://bobbyhadz.com/blog/typescript-left-hand-side-of-assignment-not-optional
  uploadFile(form:Form): void {
    var importedFile  = (document.getElementById('jsonfile') as HTMLInputElement)?.files?.item(0);
    var reader = new FileReader();
    reader.readAsText(importedFile as Blob);
    reader.onload = function() {
      const fileContent = JSON.parse(reader.result as string);
      form = new Form(fileContent.title);
      if(fileContent.contents.length > 0){
        for(let i = 0; i< fileContent.contents.length; i++){
          const contentJson = fileContent.contents[i];
          if(contentJson.hasOwnProperty('label')){
            var labelInput = form.addLabelInputGroup(contentJson.label.textContent);
            labelInput.input.value = contentJson.input.value;
          }
          else if(contentJson.hasOwnProperty('items')){
            var list;
            var referenceList;
            if(contentJson.hasOwnProperty('referenceList')){
              form.contents.forEach(element => {if(element.id = contentJson.referenceList.id && element instanceof List){referenceList = element;}})
            }
            list = form.addList(contentJson.title,contentJson.prefix,referenceList);
            var items = [];
              for(let i = 0; i< contentJson.items.length; i++){
                const itemJson = contentJson.items[i];
                const item = new Item(itemJson.label.textContent as number,itemJson.hasAddBtn,itemJson.hasRmvBtn,list);
                item.input.value = itemJson.input.value;
                  if(item.refDropdown != undefined){
                      for(let x = 0; x < itemJson.refDropdown.checkboxes.length; x++){
                        const checkboxesJson = itemJson.refDropdown.checkboxes[x];
                        item.refDropdown.checkboxes[x] = new Checkbox(checkboxesJson.id,checkboxesJson.label.textContent,checkboxesJson.input.checked);
                      }
                  }
                items.push(item);
              }
              list.items = items;
            }
          }
        }
        form.update();
      }
  }

  //
  createButtonsHtml(): HTMLDivElement{
    const buttonsDiv = new Div("buttonsDiv",["container"]).html();

    const saveJsonDiv = new Div("saveJsonDiv",["d-inline","p-2"]).html();
    const saveJsonBtn = new Button("Guardar Formulário").html();
    saveJsonBtn.addEventListener("click",()=>this.downloadJsonFile('Formulario.json', JSON.stringify(this)));
    saveJsonDiv.appendChild(saveJsonBtn);

    const uploadJsonDiv = new Div("uploadJsonDiv",["d-inline","p-2"]).html();
    const uploadJsonBtn = new Input("jsonfile","file",["btn","btn-primary","custom-file-input"]).html();
    uploadJsonBtn.name = "file";
    uploadJsonBtn.accept = ".json";
    uploadJsonBtn.addEventListener("change",()=>this.uploadFile(this));
    uploadJsonDiv.append(uploadJsonBtn);
    
    const txtDiv = new Div("txtDiv",["d-inline","p-2"]).html();
    const txtBtn = new Button("Gerar ficheiro de Texto").html();
    txtBtn.addEventListener("click",()=>this.downloadTxtFile('Texto.txt', this.text()));
    txtDiv.append(txtBtn);
    buttonsDiv.append(saveJsonDiv,uploadJsonDiv, txtDiv);

    return buttonsDiv;
  }

  html(): HTMLElement{
    const form = document.createElement("form");
    form.id = this.id;
    form.classList.add("m-3","border","border-dark");
    form.append(new Title(this.id+"Title", this.title).html());
    form.append(this.createButtonsHtml());

    for(let i = 0; i < this.contents.length; i++){
      const html = this.contents[i].html();
      var buttons = Array.from(html.getElementsByTagName("button"));
      var inputs = Array.from(html.getElementsByTagName("input"));
      buttons.forEach(element => element.addEventListener("click",() =>  this.update()));
      inputs.forEach(element => element.addEventListener("change",() =>  this.update()));
      form.appendChild(html);
    }

    return form;
  }

  text(){
    var string = "---- "+ this.title + " ----" + "\n";
    this.contents.forEach(element => string += element.text() + "\n");
    return string;
  }
}

export class LabelInputGroup {
  id : string;
  label : Label;
  input: Input;

  constructor(id: string, label: Label, input: Input) { 
    this.id = id;
    this.label = label;
    this.input = input;
  }

  html(){
      const div = new Div(this.id,["m-3","p-3","border","border-dark"]).html();
      div.append(this.label.html(),this.input.html());
      return div;
    }

  text(){
    const text = this.label.textContent + ": " + this.input.value;
    return text;
  }
  
}

export class Title{
  id: string;
  textContent: string;

  constructor(id: string, textContent: string){
    this.id = id;
    this.textContent= textContent;
  }

  html(){
    const title = document.createElement("h1");
    title.id = this.id;
    title.textContent = this.textContent;
    title.classList.add("text-center","p-2");
    return title;
  }
}

export class ListTitle{
  id: string;
  textContent: string;

  constructor(id: string, textContent: string){
    this.id = id;
    this.textContent= textContent;
  }

  html(){
    const title = document.createElement("h5");
    title.id = this.id;
    title.textContent = this.textContent;
    title.classList.add("p-2");
    return title;
  }
}

export class Input {
  id : string;
  type : string;
  classes: string[] | undefined;
  value: string;
  checked: boolean;

  constructor(id: string, type: string, classes: string[] = ["form-control"], value: string = "", checked: boolean = false) { 
    this.id = id;
    this.type = type;
    this.classes = classes;
    this.value = value;
    this.checked = checked;
  }

  setChecked(checked: boolean){
    this.checked = checked;
  }

  html() : HTMLInputElement {
    const input = document.createElement("input");
    input.id = this.id;
    input.type = this.type;
    input.value = this.value;
    input.checked = this.checked;
    input.addEventListener("change", () => 
    {
      this.value = input.value;
      this.checked = input.checked;
    });
    if(this.classes != undefined){this.classes.forEach(element => input.classList.add(element))};
    return input;
  }
}

export class Label {
  textContent : string;
  forInput : string;
  classes : string[] | undefined;

  constructor(textContent: string, forInput: string, classes?: string[]) { 
    this.textContent = textContent;
    this.forInput = forInput;
    this.classes = classes;
  }

  html() : HTMLLabelElement {
    const label = document.createElement("label");
    label.textContent = this.textContent;
    label.htmlFor = this.forInput;
    if(this.classes != undefined){this.classes.forEach(element => label.classList.add(element))};
    return label;
  }
}

export class Div {
  id: string;
  classes: string[];

  constructor(id: string, classes: string[]){
    this.id = id;
    this.classes = classes;
  }
  
  html(): HTMLDivElement{
    const div = document.createElement("div");
    div.id = this.id;
    this.classes.forEach(element => div.classList.add(element));
    return div;
  }
}

export class Button {
  textContent : string;

  constructor(textContent: string) { 
    this.textContent = textContent;
  }

  html(){
    const button = document.createElement("button");
    button.textContent = this.textContent;
    button.type = "button";
    button.classList.add("btn","btn-primary")
    return button;
  }
}

export class List {
  id: string;
  title: string;
  prefix: string | undefined;
  referenceList: List | undefined;
  items: Item[];
  
  constructor(id: string, title: string, prefix?: string, referenceList? : List) {
    this.id = id;
    this.title = title;
    this.items = [];
    this.referenceList = referenceList;
    this.prefix = prefix;
    this.addItem(this.items.length + 1,true,false); // number, hasAddBtn, hasRmvBtn
  }

  addItem(number: number, hasAddBtn:boolean, hasRmvBtn:boolean){
    const item = new Item(number,hasAddBtn,hasRmvBtn,this); // number, hasAddBtn, hasRmvBtn, list
    this.items.push(item);
  }

  deleteItem(item: Item){
    const index = item.number-1;
    this.items.splice(index, 1);
    for(let i = 0; i < this.items.length; i++){
      this.items[i].updateNumber(i+1);
    }
  }
  html(): HTMLElement{
    var list = new Div(this.id,["list-group","m-3","p-3","border", "border-dark"]).html();
    list.append(new ListTitle(this.id+"Title",this.title).html());
    var itemsDiv = document.createElement("div");

    for(let i = 0; i < this.items.length; i++){
      var itemHTML = this.items[i].html();
      var buttons = Array.from(itemHTML.getElementsByTagName("button"));
      buttons.forEach(
        element =>  { 
          if(element.textContent == "+"){
            element.addEventListener("click",() =>  {
            this.items[i].hasRmvBtn = true;
            this.items[i].hasAddBtn = false;
            this.addItem(this.items.length + 1,true,true);
          })
          }
          else if(element.textContent == "-"){
            element.addEventListener("click",() => {
              if(i-1 >= 0 && this.items.length == 2 ){
                console.log("(i-1 >= 0 && this.items.length == 2 )");
                this.items[i-1].hasAddBtn = true;
                this.items[i-1].hasRmvBtn = false;
              }
              else if(this.items.length == 2){
                console.log("(this.items.length == 2)");
                this.items[i+1].hasAddBtn = true;
                this.items[i+1].hasRmvBtn = false;
              }
              else if(i-1 > 0){
                console.log("else");
                this.items[i-1].hasAddBtn = true;
                this.items[i-1].hasRmvBtn = true;
              }
              this.deleteItem(this.items[i])});
          }
      })
      itemsDiv.append(itemHTML);
    }
    list.append(itemsDiv);
    return list;
  }

  text(){
    var text = "\n" + "--" + this.title + "--";
    for(let i = 0; i < this.items.length; i++){
      const item = this.items[i];
      text += "\n"+ "\n" + item.label.textContent +": " +item.input.value;
      if(this.referenceList != undefined){
        text += "\n" + item.prefix;
        for(let i = 0; i < item.refDropdown!!.checkboxes.length; i++){
        if(item.refDropdown!!.checkboxes[i].input.checked){
            text +=  "\n" + item.refDropdown!!.checkboxes[i].label.textContent;
        }
      }
      }
    }
    return text;
  }
}

export class Item {
  number: number;
  id: string;
  label: Label;
  input: Input;
  hasAddBtn: boolean;
  hasRmvBtn: boolean;
  refDropdown: Dropdown | undefined;
  prefix: string | undefined;
  

  constructor(number: number, hasAddBtn: boolean, hasRmvBtn: boolean, list: List) {
    this.number = number;
    this.id = list.id+'Item'+number;
    this.hasAddBtn = hasAddBtn;
    this.hasRmvBtn = hasRmvBtn;
    this.prefix = list.prefix;
    this.label = new Label(number+"",this.id+"Input",["form-control"]);
    this.input = new Input(this.id+"Input","text");
    if(list.referenceList != undefined){
      this.refDropdown = new Dropdown(this.id + "refDropdown",list.referenceList);
    }
  }

  updateNumber(number: number){
    this.number = number;
    //this.id = this.list.id+'Item'+number;
    this.label.textContent = ""+number;
    this.label.forInput = this.id;
    this.input.id = this.id;
  }
  
  html(){
    var itemDiv = document.createElement("div");
    itemDiv.classList.add("list-group-item","m-2");

    var div = document.createElement("div");
    div.classList.add("d-flex", "flex-row");     

    itemDiv.appendChild(div);

    var labelDiv = new Div(this.id+"-label",["p-2"]).html();
    var inputDiv = new Div(this.id+"-input",["p-2","col-10"]).html();
    labelDiv.appendChild(this.label.html());
    inputDiv.appendChild(this.input.html());

    div.append(labelDiv,inputDiv);

    if(this.hasRmvBtn){
      var rmvBtnDiv = new Div(this.id+"-rmvBtn",["p-2"]).html();
      rmvBtnDiv.appendChild(new Button("-").html());
      div.append(rmvBtnDiv);
    }
    
    if(this.hasAddBtn){
      var addBtnDiv = new Div(this.id+"-addBtn",["p-2"]).html();
      addBtnDiv.appendChild(new Button("+").html());
      div.append(addBtnDiv);
    }

    if(this.refDropdown != undefined){
      var contentReferences = new Div(this.id+"RefDropdownDiv",["m-2"]).html();
      const title = document.createElement("p");
      const list = document.createElement("ul");
      if(this.prefix != undefined) {title.textContent = this.prefix;};
      for(let i = 0; i < this.refDropdown.checkboxes.length; i++){
        if(this.refDropdown.checkboxes[i].input.checked){
          const listItem = document.createElement("li");
          listItem.textContent = this.refDropdown.checkboxes[i].label.textContent;
          list.appendChild(listItem);
        }
      }
      contentReferences.append(title,list);
      itemDiv.append(contentReferences,this.refDropdown.html());
    }
    return itemDiv;
  }
}

export class Dropdown {
  id: string;
  referenceList : List;
  checkboxes: Checkbox[];

  constructor(id: string, referenceList : List) {
    this.id = id;
    this.referenceList = referenceList;
    this.checkboxes = [];
  }

  updateCheckbox(){
    const newCheckboxes = [];
    for(let i= 0; i < this.referenceList.items.length ;i++){
      const item = this.referenceList.items[i];
      if(item.input.value != ""){
        const checkbox = new Checkbox(this.id+"Option"+item.id,item.input.value);
        this.checkboxes.forEach(element => {
          if(checkbox.label.textContent == element.label.textContent){
            checkbox.input.checked = element.input.checked;
          }
        })
        newCheckboxes.push(checkbox);
      }
    }
    this.checkboxes = newCheckboxes;
  }

  html(){
    const div = document.createElement("div");

    const a = document.createElement("a");
    a.classList.add("btn", "btn-primary" ,"dropdown-toggle");
    a.setAttribute("data-bs-toggle","dropdown");
    a.textContent = this.referenceList.title;
    div.append(a);

    const ul = document.createElement("ul");
    ul.className = "dropdown-menu";

    const li = document.createElement("li");
    const aa = document.createElement("a");
    aa.classList.add("dropdown-item");

    this.updateCheckbox();
    this.checkboxes.forEach(element => {aa.append(element.html())});

    li.appendChild(aa)
    ul.appendChild(li);
    div.appendChild(ul);
    return div;
  }
}

export class Checkbox {
  id : string;
  label: Label;
  input: Input;

  constructor(id: string, text : string, checked: boolean = false ) { 
    this.id = id;
    this.label = new Label(text,this.id+"Input",["form-check-label"]);
    this.input = new Input(this.id+"Input","checkbox",["form-check-input"],undefined,checked);
  }

  html(){
    const div = new Div(this.id+"Checkbox",["form-check"]).html();
    div.append(this.input.html(),this.label.html());
    return div;
  }
}
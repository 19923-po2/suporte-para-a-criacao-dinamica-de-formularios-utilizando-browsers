import { Component, Directive, OnInit } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})

export class FormComponent implements OnInit {
  
  constructor() {
  }

  ngOnInit(): void {
    const ucForm = new Form("ucForm","Planeamento da Unidades Curricular"); // Formulario
    ucForm.addLabelInputGroup("ucName",new Label("Nome da UC","ucName"),new Input("ucName","text"));
    const list = ucForm.addList("contentsList","Conteúdos"); // Lista de Conteúdos
    ucForm.addList("goalsList","Objetivos",list); // Lista de Objetivos com referência à lista de conteúdos
    ucForm.show();
  }  
}

/**************************************************************/ 
export class Form {
  id: string;
  title: Title;
  contents: (List | LabelInputGroup)[];

  constructor(id: string,title: string) {
    this.id = id;
    this.title = new Title(id+"-title",title,["text-center","p-2"]);
    this.contents = [];
  }
  
  show(){
    const formElement = this.html(); 
    document.getElementById("main")?.appendChild(formElement);
  }

  update(){
    //console.log("update");
    document.getElementById("main")!!.innerHTML = "";
    this.show();
  }

  // https://stackoverflow.com/questions/34504050/how-to-convert-selected-html-to-json
  downloadJsonFile(arg: { fileName: string, text: string; }) {
    var dynamicDownload = document.createElement('a');
    const element = dynamicDownload;
    const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

  downloadTxtFile(arg: { fileName: string, text: string; }){
    var dynamicDownload = document.createElement('a');
    const element = dynamicDownload;
    const fileType = arg.fileName.indexOf('.txt') > -1 ? 'text/txt' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);

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
      form = new Form(fileContent.id, fileContent.title.textContent);
      form.contents = [];
      if(fileContent.contents.length > 0){
        for(let i = 0; i< fileContent.contents.length; i++){
          const content = fileContent.contents[i];
          if(content.hasOwnProperty('label')){
          //ucForm.addLabelInputGroup("ucNameFormGroup",new Label("Nome da UC","ucName"),new Input("ucName","text")); // FormGroup Nome UC
          form.addLabelInputGroup(content.id,new Label(content.label.textContent,content.label.forInput,content.label.classes),new Input(content.input.id,content.input.type,content.input.classes,content.input.value));
          }
          else if(content.hasOwnProperty('title')){
            var list;
            var referenceList;
            if(content.hasOwnProperty('referenceList')){
                    form.contents.forEach(element => {if(element.id = content.referenceList.id && element instanceof List){referenceList = element;}})
                    list = form.addList(content.id,content.title,referenceList);  
            }
            else {
              list = form.addList(content.id,content.title,referenceList);
            }
            if(content.items.length > 0){
                var items = [];
              for(let i = 0; i< content.items.length; i++){
                const itemJson = content.items[i];
                    const item = new Item(itemJson.label.textContent as number,itemJson.id,itemJson.hasAddBtn,itemJson.hasRmvBtn,referenceList);
                    item.input.value = itemJson.input.value;
                    items.push(item);
                  //}
              }
              list.items = items;
            }
            
          }
        }
      }
      console.log(form.contents);
      form.update();
  }
  }

  //addLabelInput
  addLabelInputGroup(id: string, label: Label, input: Input): LabelInputGroup{
    const labelInputGroup = new LabelInputGroup(id, label, input);
    this.contents.push(labelInputGroup);
    return labelInputGroup;
  }

  //addList
  addList(id: string, title: string, referenceList? : List): List{
    const list = new List(id, title,referenceList);
    this.contents.push(list);
    return list;
  }

  createButtonsHtml(): HTMLDivElement{
    const buttonsDivHtml = new Div("buttonsDiv",["container"]).html();
    const saveJsonDivHtml = new Div("saveJsonDiv",["d-inline","p-2"]).html();
    const uploadJsonDivHtml = new Div("uploadJsonDiv",["d-inline","p-2"]).html();

    const saveJsonBtnHtml = new Button("Save JSON").html();
    saveJsonBtnHtml.addEventListener("click",()=>this.downloadJsonFile({ fileName: 'Dados.json', text: JSON.stringify(this)}));
    
    const uploadJsonBtnHtml = new Input("jsonfile","file",["btn","btn-primary"]).html();
    uploadJsonBtnHtml.name = "file";
    uploadJsonBtnHtml.accept = ".json";
    //<input class="btn btn-primary" type="file" id="jsonfile" name="file" (change)="uploadFile()" accept=".json"/>
    uploadJsonBtnHtml.addEventListener("change",()=>this.uploadFile(this));
    
    const txtBtnHtml = new Button("Download Text").html();
    txtBtnHtml.addEventListener("click",()=>this.downloadTxtFile({fileName: 'Texto.txt', text: this.text()}));
    saveJsonDivHtml.appendChild(saveJsonBtnHtml);
    uploadJsonDivHtml.appendChild(uploadJsonBtnHtml);
    buttonsDivHtml.append(saveJsonDivHtml,uploadJsonDivHtml, txtBtnHtml);

    return buttonsDivHtml;
  }
  
  text(){
    var string = "---- "+ this.title.textContent + " ----" + "\n";
    this.contents.forEach(element => string += element.text() + "\n");
    return string;
  }

  html(): HTMLElement{
    const form = document.createElement("form");
    form.id = this.id;
    form.classList.add("m-3","border", "border-dark");

    form.append(this.title.html());

    form.appendChild(this.createButtonsHtml());

    for(let i = 0; i < this.contents.length; i++){
      const html = this.contents[i].html();
      var buttons = Array.from(html.getElementsByTagName("button"));
      var inputs = Array.from(html.getElementsByTagName("input"));
      inputs.forEach(element => {
        if(element.classList.contains("form-check-input")){
          inputs = inputs.splice(inputs.indexOf(element), 1);
        }
      });
      console.log(inputs.length);
      buttons.forEach(element => element.addEventListener("click",() =>  this.update()));
      inputs.forEach(element => element.addEventListener("change",() =>  this.update()));
      form.appendChild(html);
    }

    return form;
  }
}
export class Title{
  id: string;
  textContent: string;
  classes: string[]

  constructor(id: string, textContent: string, classes: string[]){
    this.id = id;
    this.textContent= textContent;
    this.classes = classes;
  }

  html(){
    const title = document.createElement("h1");
    title.id = this.id;
    this.classes.forEach(element => title.classList.add(element));
    title.textContent = this.textContent;
    return title;
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

export class Input {
  id : string;
  type : string;
  value: string;
  classes: string[];

  constructor(id: string, type: string, classes : string[] = ["form-control"] , value: string = "") { 
    this.id = id;
    this.type = type;
    this.value = value;
    this.classes = classes;
  }

  html() : HTMLInputElement {
    const input = document.createElement("input");
    input.type = this.type;
    input.id = this.id;
    input.setAttribute("value",this.value);
    this.classes.forEach(element => input.classList.add(element));
    input.addEventListener("change", () =>  this.updateValue(input)); // altera valor quando o utilizador escreve no input
    return input
  }

  updateValue(input: HTMLInputElement){
    input.setAttribute("value",input.value); 
    this.value = input.value;
  }
}

export class Label {
  textContent : string;
  forInput : string;
  classes: string[];

  constructor(textContent: string, forInput: string, classes : string[] = []) { 
    this.textContent = textContent;
    this.forInput = forInput;
    this.classes = classes;
  }

  html() : HTMLLabelElement {
    const label = document.createElement("label");
    label.textContent = this.textContent;
    label.htmlFor = this.forInput;
    this.classes.forEach(element => label.classList.add(element));
    return label;
  }
}

export class LabelInputGroup {
  id : string;
  label : Label;
  input: Input;

  constructor(id: string, label:  Label, input: Input) { 
    this.id = id;
    this.label = label;
    this.input = input;
  }

  html(){
      const div = new Div(this.id,["form-group","p-3"]).html();
      div.append(this.label.html(),this.input.html());
      return div;
    }

  text(){
    const text = this.label.textContent + ": " + this.input.value;
    return text;
  }
  
}

export class Checkbox {
  id : string;
  textContent: string;
  checked: boolean;

  constructor(id: string, textContent : string) { 
    this.id = id;
    this.textContent = textContent;
    this.checked = false;
  }

  html(){
    
    const div = new Div(this.id+"-checkbox",["form-check"]).html();

    const input = new Input(this.id,"checkbox",["form-check-input"]);
    div.addEventListener("change", () => this.checked = this.setChecked()); // altera valor quando o utilizador escreve no input

    const label = new Label(this.textContent,this.id,["form-check-label"]);
    div.append(input.html(),label.html());
    return div;
  }
  setText(text:string){
  console.log("TEXTONCENT");
    this.textContent = text;
  }

  setChecked(){
    if(this.checked){
      return false;
    }
    else{
      return true;
    }
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

export class Dropdown {
  btnText : string;
  options: string[];
  //checkboxes: Checkbox[];

  constructor(btnText: string, options : string[]) { 
    this.btnText = btnText;
    this.options = options;
  }

  html(){
    const div = document.createElement("div");
    div.innerHTML = '<a class="btn btn-primary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">'+this.btnText+'</a>'

    const ul = document.createElement("ul");
    ul.className = "dropdown-menu";

    const li = document.createElement("li");
    const aa = document.createElement("a");
    aa.classList.add("dropdown-item");
    aa.href="#"
    this.options.forEach(element => {if(element != "")aa.append(new Checkbox("checkboxID",element).html())});
    li.appendChild(aa)
    ul.appendChild(li);
    div.appendChild(ul);
    return div;
  }
}

export class List {
  id: string;
  title: string;
  referenceList: List | undefined;
  items: Item[];
  
  constructor(id: string, title: string, referenceList? : List) {
    this.id = id;
    this.title = title;
    this.items = [];
    this.referenceList = referenceList;
    this.addItem(this.items.length + 1,true,false,this.referenceList);
  }
  
  html(): HTMLElement{
    var list = new Div(this.id,["list-group","m-3","p-3","border", "border-dark"]).html();
    list.append(this.title);

    var itemsDiv = document.createElement("div");

    for(let i = 0; i < this.items.length; i++){
      if(this.referenceList != undefined){
        this.items[i].updateReferences(this.referenceList);
      }
      var itemHTML = this.items[i].html();
      var buttons = Array.from(itemHTML.getElementsByTagName("button"));
      buttons.forEach(
        element =>  { 
          if(element.textContent == "+"){
            element.addEventListener("click",() =>  this.addItem(this.items.length + 1,true,true,this.referenceList));
          }
          else if(element.textContent == "-"){
            element.addEventListener("click",() => this.deleteItem());
          }
      })
      itemsDiv.append(itemHTML);
    }
    list.append(itemsDiv);
    return list;
  }
  
  addItem(number: number, hasAddBtn:boolean,hasRmvBtn:boolean,referenceList? : List){
    const item = new Item(number,this.id+'-item-'+number,hasAddBtn,hasRmvBtn,referenceList);
    this.items.push(item);
  }

  deleteItem(){
    this.items.pop();
  }

  text(){
    var text = this.title + "\n";
    this.items.forEach(element => text += element.label.textContent +":" +element.input.value + "\n");
    return text;
  }
}

export class Item {
  id: string;
  label: Label;
  input: Input;
  hasAddBtn: boolean;
  hasRmvBtn: boolean;
  refDropdown: Dropdown | undefined;

  constructor(number: number, id: string, hasAddBtn: boolean, hasRmvBtn: boolean, referenceList? : List ) {
    this.id = id;
    this.label = new Label(""+number,id,["form-control"]);
    this.input = new Input(id,"text");
    this.hasAddBtn = hasAddBtn;
    this.hasRmvBtn = hasRmvBtn;
    if(referenceList != undefined){
      var options = [];
      for(let i = 0; i < referenceList.items.length; ++i){
        options.push(referenceList.items[i].input.value);
      }
      this.refDropdown = new Dropdown("Escolha as opções",options);
    }
  }

  updateReferences(referenceList: List){
    if(this.refDropdown != undefined){
    var options = [];
      for(let i = 0; i < referenceList.items.length; ++i){
        options.push(referenceList.items[i].input.value);
      }
      this.refDropdown.options = options;
    }
  }
  
  html(){
    var item = document.createElement("div");
    item.classList.add("list-group-item","m-2");

    var div = document.createElement("div");
    div.classList.add("d-flex", "flex-row");     

    item.appendChild(div);

    var labelDiv = new Div(this.id+"-label",["p-2"]).html();
    labelDiv.appendChild(this.label.html());

    var inputDiv = new Div(this.id+"-input",["p-2"]).html();
    inputDiv.appendChild(this.input.html());

    div.append(labelDiv,inputDiv);

    if(this.hasAddBtn){
    var addBtnDiv = new Div(this.id+"-addBtn",["p-2"]).html();
    addBtnDiv.appendChild(new Button("+").html());
    div.append(addBtnDiv);
    }
    if(this.hasRmvBtn){
    var rmvBtnDiv = new Div(this.id+"-rmvBtn",["p-2"]).html();
    rmvBtnDiv.appendChild(new Button("-").html());
    div.append(rmvBtnDiv);
    }

    if(this.refDropdown != undefined){
      var contentReferences = document.createElement("div");
      var titleReferences = document.createElement("p");
      titleReferences.textContent = "Conteúdos";
      contentReferences.append(titleReferences);
      item.append(contentReferences,this.refDropdown.html());
    }
    return item;
  }
}
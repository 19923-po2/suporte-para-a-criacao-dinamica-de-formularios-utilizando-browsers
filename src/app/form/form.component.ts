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
    const ucForm = new Form("ucForm","Planeamento da Unidades Curricular"); // ID e Title
    ucForm.addLabelInputGroup("ucName","Nome da UC"); // ID e Title
    const list = ucForm.addList("contentsList","Conteúdos"); // ID e Title
    ucForm.addList("goalsList","Objetivos",list); //ID, Title e referenceList
    ucForm.show(); // Show
  }  
}

/**************************************************************/ 

export class Form {
  id: string;
  title: string;
  contents: (List | LabelInputGroup)[];

  constructor(id: string, title: string) {
    this.id = id;
    this.title = title;
    this.contents = [];
  }
  
  addLabelInputGroup(id: string, title: string): LabelInputGroup{
    const inputId = id+"Input";
    const labelInputGroup = new LabelInputGroup(id, new Label(title, inputId), new Input(inputId,"text"));
    this.contents.push(labelInputGroup);
    return labelInputGroup;
  }

  addList(id: string, title: string, referenceList? : List): List{
    const list = new List(id, title , referenceList);
    this.contents.push(list);
    return list;
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
          //form.addLabelInputGroup(content.id,new Label(content.label.textContent,content.label.forInput,content.label.classes),new Input(content.input.id,content.input.type,content.input.classes,content.input.value));
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
                    const item = new Item(itemJson.label.textContent as number,itemJson.hasAddBtn,itemJson.hasRmvBtn,content);
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
    var string = "---- "+ this.title + " ----" + "\n";
    this.contents.forEach(element => string += element.text() + "\n");
    return string;
  }

  html(): HTMLElement{
    const form = document.createElement("form");
    form.id = this.id;
    form.classList.add("m-3","border", "border-dark");

    form.append(new Title(this.id+"Title",this.title).html());

    form.appendChild(this.createButtonsHtml());

    for(let i = 0; i < this.contents.length; i++){
      const html = this.contents[i].html();
      var buttons = Array.from(html.getElementsByTagName("button"));
      var inputs = Array.from(html.getElementsByTagName("input"));
      inputs.forEach(element => {
        if(element.classList.contains("form-check-input")){
          inputs = inputs.splice(inputs.indexOf(element)-1, 1);
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
    input.addEventListener("change", () => {this.value = input.value, this.checked = input.checked});
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
  referenceList: List | undefined;
  items: Item[];
  
  constructor(id: string, title: string, referenceList? : List) {
    this.id = id;
    this.title = title;
    this.items = [];
    this.referenceList = referenceList;
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
            this.items[0].hasRmvBtn = true;
            this.items[i].hasAddBtn = false;
            this.addItem(this.items.length + 1,true,true);
          })
          }
          else if(element.textContent == "-"){
            element.addEventListener("click",() => {
              if(this.items.length == 2){
                this.items[0].hasAddBtn = true;
                this.items[0].hasRmvBtn = false;
              }
              this.deleteItem(this.items[i])});
              this.items[this.items.length-1].hasAddBtn = true;
          }
      })
      itemsDiv.append(itemHTML);
    }
    list.append(itemsDiv);
    return list;
  }

  

  text(){
    var text = "--" + this.title + "--" + "\n";
    for(let i = 0; i < 0; i++){
      const item = this.items[i];
      text += item.label.textContent +": " +item.input.value + "\n"
      if(this.referenceList != undefined){
        text += item.refDropdown?.referenceList.title + ": ";
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

  constructor(number: number, hasAddBtn: boolean, hasRmvBtn: boolean, list: List) {
    this.number = number;
    this.id = list.id+'Item'+number;
    this.hasAddBtn = hasAddBtn;
    this.hasRmvBtn = hasRmvBtn;
    this.label = new Label(number+"",this.id+"Input",["form-control"]);
    this.input = new Input(this.id+number+"Input","text");
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
      var contentReferences = new Div(this.id+"RefDropdownDiv",["m-2"]);
      /*var titleReferences = document.createElement("p");
      if(this.list.referenceList != undefined){
        titleReferences.textContent = this.list.referenceList?.title.textContent;
      }
      contentReferences.append(titleReferences);*/
      itemDiv.append(contentReferences.html(),this.refDropdown.html());
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
          if(checkbox.text == element.text){
            checkbox.checked = element.checked;
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
    this.checkboxes.forEach(element => {aa.append(element.html()); console.log("aaaa"+element.checked)});
    //this.referenceList.items.forEach(element => {if(element.input.value != "") aa.append(new Checkbox("checkboxID",element).html())});

    li.appendChild(aa)
    ul.appendChild(li);
    div.appendChild(ul);
    return div;
  }
}

export class Checkbox {
  id : string;
  checked: boolean;
  text: string;

  constructor(id: string, text : string, checked: boolean = false ) { 
    this.id = id;
    this.text= text;
    this.checked = checked;
  }

  html(){
    const div = new Div(this.id+"Checkbox",["form-check"]).html();
    const input = new Input(this.id,"checkbox",["form-check-input"]);
    const label = new Label(this.text,this.id,["form-check-label"]);
    div.addEventListener("change", () => {this.checked = this.updateChecked(); input.setChecked(this.checked);
    });
    div.append(input.html(),label.html());
    return div;
  }

  updateChecked(){
    if(this.checked){
      return false;
    }
    else{
      return true;
    }
  }
}
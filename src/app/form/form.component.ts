import { Component, Input, OnInit } from '@angular/core';
import { readFileSync } from 'fs';
import { listenerCount } from 'process';
import { last } from 'rxjs-compat/operator/last';
import { json } from 'stream/consumers';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  public itemCounter = 1;

  constructor() { }

  ngOnInit(): void {

  }

  addItem(): void {
    this.itemCounter += 1; // increase item counter

    var item = document.createElement("input"); // create input element
    item.type = "text";
    item.id = this.itemCounter + "-item";

    var label = document.createElement("p");
    label.textContent = "Item " + this.itemCounter;
    label.id =  this.itemCounter + "-label";

    document.getElementById("list")?.append(label);
    document.getElementById("list")?.append(item);
  }
  
  deleteItem(): void {
    if(this.itemCounter > 0){
    var listItems = document.getElementById("list")?.getElementsByTagName("input");
    listItems?.item(this.itemCounter - 1)?.remove();

    var listLabels = document.getElementById("list")?.getElementsByTagName("p");
    listLabels?.item(this.itemCounter - 1)?.remove();

    this.itemCounter -= 1;
    }
  }

  uploadFile(): void {
      // https://bobbyhadz.com/blog/typescript-left-hand-side-of-assignment-not-optional
      // https://stackoverflow.com/questions/68033722/filereader-onload-never-fired-in-angular

    var importedFile  = (document.getElementById('jsonfile') as HTMLInputElement)?.files?.item(0);
    var reader = new FileReader();
    reader.readAsText(importedFile as Blob);
    reader.onload = function() {
    var fileContent = JSON.parse(reader.result as string);
    var items = fileContent.items;

    /* Remover todos os inputs que estão na interface */
    const myNode = document.getElementById("list");
      while (myNode?.firstChild) {
        myNode.removeChild(myNode.lastChild as Node);
      }

    /* Criar todos os inputs para cada elemento da lista */
    for (let i = 0; i < items.length; i++) {
      var item = document.createElement("input"); // create input element
      item.type = "text";
      item.id = i + "-item";
      item.value = "" + items[i];

      var label = document.createElement("p");
      label.textContent = "Item " + (1 + i);
      label.id =  i + "-label";

      document.getElementById("list")?.append(label);
      document.getElementById("list")?.append(item);
    }
    }
    /*
      const fname = (document.getElementById('fname') as HTMLInputElement | null);
      const lname = (document.getElementById('lname') as HTMLInputElement | null);
      if (fname != undefined) {
        console.log(fileContent.fname);
        fname.outerHTML = '<input type="text" id="fname" name="fname" value="'+fileContent.fname+'">'
      }

      if (lname != undefined) {
        console.log(fileContent.fname);
        lname.outerHTML = '<input type="text" id="fname" name="fname" value="'+fileContent.lname+'">'
      }*/
  }




  saveToJSONFile(): void {
    // get value of inputs
    var itemList = document.getElementById("list")?.getElementsByTagName("input");
    var jsonText = '{ "size":'+this.itemCounter+', "items":['; // { "firstName":"John" , "lastName":"Doe" }

    for (let i = 0; i < itemList!.length; i++) {
      jsonText += '"'+itemList?.item(i)?.value+'",';
    }
    
    jsonText = jsonText.slice(0, -1);
    jsonText += "]} "

    console.log(jsonText);

    // create json file
    this.createJsonFile({ fileName: 'Dados.json', text: jsonText});

  }
  

  // https://stackblitz.com/edit/httpsstackoverflowcomquestions51806464how-to-create-and-downloa?file=src%2Fapp%2Fapp.component.html,src%2Fapp%2Fhello.component.ts,src%2Fapp%2Fapp.component.ts

  createJsonFile(arg: {
    fileName: string,
    text: string
  }) {
    var dynamicDownload = document.createElement('a');
    const element = dynamicDownload;
    const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

}

var data= [];
var progress=0;
var width=620;
var height= 750;
var imgWidth= 0;
var imgHeight=0;
var pdfSize=0;
var pdfName;
var displayInput= true;
var displayImage= false;
var convertBtn= false;
var toggle= 'true';
var fileSize=0;
var fileName= '';

const createPDF= document.getElementById('create-pdf');

encodeImageFileAsURL= (element)=>{
    document.getElementById('input-page').style.display="none";
    document.getElementById('upload-msg').style.display="none";
    document.getElementById('convertBtn').style.display="inline-block";
    document.getElementById('pdf-page').style.display="inline-block"
    const length= element.files.length
    var filesize=0;
    for(var i=0;i<length;i++){
        let file = element.files[i];
        let pdfname = element.files[0];
        filesize= filesize+ element.files[i].size
        let reader = new FileReader();
        reader.readAsDataURL(file);
        let obj={
            list:reader,
            fileName:file.name,
            time: new Date().toString() + i
        }
    
        reader.onloadend = ()=> {
            data=[...data,obj];
            console.log(data)
            pdfName= pdfname.name;
            console.log(pdfName.slice(0,-4))
            displayInput=false;
            displayImage=true;
            fileSize= filesize;
            progress= progress+((1*100)/length);
        }
    }
    setTimeout(convertToPDF,1000)
    document.getElementById('upload-file').value= null;    
}

calcPdfSize= async (ev, decimals = 2)=> {
    document.getElementById(ev.id).style.display=  "none";
    document.getElementById('download').style.display=  "inline-block";
}

//download file
embedImages=async ()=>{            
    const pdfDoc = await PDFLib.PDFDocument.create()
    for(var i=0;i<data.length;i++)
        {
        
        const jpgUrl = data[i].list.result
        const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer())
        
        const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
        // Add a blank page to the document
        const page = pdfDoc.addPage();
        
        
        if(width>0&&height>0){
            page.setSize(width,height)
            console.log(page.getWidth(),page.getHeight());
            page.drawImage(jpgImage, {
            x: 20,
            y: 50,
            width: page.getWidth()-40,
            height: page.getHeight()-100,
            })
            console.log('first page')
        }
        else{
            var jpgWidth;
            var jpgHeight;
            if(jpgImage.width>840){
            jpgWidth=840;
            jpgHeight=840
            }
            else{
            jpgWidth= jpgImage.width;
            jpgHeight= jpgImage.height;
            }
            page.setSize(jpgWidth,jpgHeight)
            console.log(jpgImage.width,jpgImage.height);
            page.drawImage(jpgImage, {
            x: 20,
            y: 20,
            width: page.getWidth()-40,
            height: page.getHeight()-40,
        })
        }      
    }     
    const pdfBytes = await pdfDoc.save()

    download(pdfBytes, pdfName.slice(0,-4), "application/pdf");
}


handleDelete=(e)=>{         
    data = data.filter((lst)=>lst.time!==e.currentTarget.id);
    if(data.length==0)
    {
        location.reload();
    }
    else{
        convertToPDF();
    }
}

setPageSize = (dims)=>{
    if(dims.target.value=='Letter(US)'){
        width= 612;
        height= 792;
    }
    else if(dims.target.value=='A4'){
        width= 595;
        height= 842;
    }
    else{
        width= 0;
        height= 0;
    }
}

function convertToPDF(){
    createPDF.innerHTML= '';
    data.map((item,i)=>{
        const fileItem= document.createElement('div');
        fileItem.setAttribute('class','file-item');
        const modify= document.createElement('div');
        modify.setAttribute('class','modify');

        const button2= document.createElement('button');
        button2.setAttribute('class','delete-btn');
        button2.setAttribute('id',item.time);
        const remove= document.createElement('i');
        button2.addEventListener('click',(e)=>{
            handleDelete(e)
        });
        remove.setAttribute('class','fa fa-trash');
        button2.appendChild(remove);

        modify.appendChild(button2);

        fileItem.appendChild(modify);

        const imgContainer= document.createElement('div')
        imgContainer.setAttribute('class','img-container')
        const img= document.createElement('img');
        img.setAttribute('id','img');
        img.src= item.list.result;
        imgContainer.appendChild(img);
        fileItem.appendChild(imgContainer);

        const imgName= document.createElement('p');
        imgName.setAttribute('id','img-name')
        imgName.innerHTML=item.fileName;
        fileItem.appendChild(imgName)
        
        createPDF.appendChild(fileItem)
    });
        const addMoreFile= document.createElement('div');
        addMoreFile.setAttribute('class','add-more-file');

        const addFile= document.createElement('div');
        addFile.setAttribute('class','inp-cont');

        const input = document.createElement('input');
        input.setAttribute('type','file');
        input.type='file';
        input.multiple="true"
        input.setAttribute('id','inp');
        input.onchange= function(){
            encodeImageFileAsURL(this)
        }

        const p= document.createElement('p');
        const i= document.createElement('i');
        i.setAttribute('class','fa fa-plus')

        p.appendChild(i);

        const label= document.createElement('label');
        label.htmlFor='inp';
        label.innerHTML= 'Add files';

        addFile.appendChild(p)
        addFile.appendChild(label)
        addFile.appendChild(input)

        addMoreFile.appendChild(addFile)

        createPDF.appendChild(addMoreFile)
}
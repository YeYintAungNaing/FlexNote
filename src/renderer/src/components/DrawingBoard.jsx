import { useContext, useRef, useState } from "react"
import { Canvas, Rect, Circle, PencilBrush} from "fabric"
//import fabric from 'fabric'
import '../styles/drawingBoard.scss'
import { SquareIcon, CircleIcon,  Pencil1Icon} from "sebikostudio-icons"
import DrawingBoardSetting from "./DrawingBoardSetting"
import axios from "axios"
import  { GlobalContext } from "../context/GlobalState"



export default function DrawingBoard() {

    const canvasRef = useRef(null)

    const [canvas, setCanvas] = useState(null)
    const [canvasSize, setCanvasSize ] = useState({ width : 500, height : 500})
    const {  showAlert, currentUser, token, alertAndLog } = useContext(GlobalContext);
    const [isEditing, setIsEditing] = useState(false)


    async function initializeCanvas() {
        if (!canvasRef.current) return;
    
        // Create Fabric.js canvas
        const inintCanvas = new Canvas(canvasRef.current, {
            width: canvasSize.width,
            height: canvasSize.height,
            isDrawingMode: false
        });
    
        inintCanvas.backgroundColor = "aliceblue";
        inintCanvas.freeDrawingBrush = new PencilBrush(inintCanvas);
        inintCanvas.freeDrawingBrush.color = "#000000";
        inintCanvas.renderAll();
        
        if (currentUser.mode === "Online") {
            getDrawingDataOnline(inintCanvas)
            
        }
        else {
            getDrawingData_(inintCanvas)
            
        }  
        setCanvas(inintCanvas)
    }

    async function getDrawingData_(inintCanvas) {
        try {
            const response = await window.electron.getDrawingData({
                token,
                userId : currentUser.id,
            })
            if (response.error) {
                alertAndLog(response.error, "error")
              }
            else if(response.drawingData) {
                setIsEditing(true)
                const drawingDataObj = JSON.parse(response.drawingData)
                await inintCanvas.loadFromJSON(drawingDataObj)
                inintCanvas.renderAll();
            }

        }
        catch(e) {
            console.log(e)
            showAlert("Unexpected error occurs", "error")
        }
    }

    async function getDrawingDataOnline(inintCanvas) {
        try {
            const res = await axios.get("http://localhost:7000/drawingBoard");
    
            if (res.data.drawingData) {
                //console.log("Fetched Data:", res.data.drawingData);
                setIsEditing(true)
                await inintCanvas.loadFromJSON(res.data.drawingData)
                inintCanvas.renderAll();         
            }
            
        } catch (e) {
            if(e.response) {   
                if(e.response.data.ServerErrorMsg) {   // response always have data 
                  //console.log(e.response.data.ServerErrorMsg)
                  showAlert(e.response.data.ServerErrorMsg, "error")
                }
                else {
                  //console.log(e)   
                  showAlert(e.message, "error")
                }
            }
              else{  
                console.log(e)
            }
        }
    }
    

    function addRectangle() {
        if(canvas) {
            const rect = new Rect({
                top : 100,
                left : 50,
                width : 100,
                height : 60,
                fill : "#0000FF"
            })
            canvas.add(rect)
        }
    }

    function addCircle() {
        if (canvas) {
            const circle = new Circle({
                top : 100,
                left : 50,
                radius : 30,
                fill : "#0000FF"
            })
            canvas.add(circle)
        }
    }

    function toggleDrawingMode() {
        if (!canvas) {
            return
        }
        canvas.isDrawingMode = !canvas.isDrawingMode
        if (canvas.isDrawingMode) {
            document.getElementById('drawing').className = "toggle-btn active"
        }
        else{
            document.getElementById('drawing').className = "toggle-btn inactive"
        }   
        
    }

    function resizeCanvas(newWidth, newHeight) {
        if (canvas) {
            canvas.setWidth(newWidth);
            canvas.setHeight(newHeight);

            // Also update the underlying <canvas> DOM element
            canvasRef.current.width = newWidth;
            canvasRef.current.height = newHeight;

            canvas.renderAll();
        }
    }

    function handleResizeChange(event) {
        const { name, value } = event.target;
        const newSize = { ...canvasSize, [name]: Number(value) };
        setCanvasSize(newSize);

        resizeCanvas(newSize.width, newSize.height);
    }

    function saveBoard() {
        if (!canvas) {
            showAlert('Plese initiate the canvas', "sucess")
            return
        }
        if (currentUser) {
            if (currentUser.mode === "Online") {
                saveDrawingDataOnline()
            }
            else{
                saveDrawingData()
            }
        }
    }

    async function saveDrawingDataOnline(){

        try{
            const drawingData = canvas.toJSON()
            const res = await axios.post(`http://localhost:7000/drawingBoard`, {
                drawingData
            })
            showAlert(res.data.message, "success")
        }
        
        catch(e) {
            if(e.response) {   
              if(e.response.data.ServerErrorMsg) {  
                console.log(e.response.data.ServerErrorMsg)
                //alertAndLog(e.response.data.ServerErrorMsg, "error")
              }
              else {
                console.log(e.message)   
                //alertAndLog(e.message, "error")
              }
            }
            else{  
              console.log(e)
            } 
        }
    }

    async function saveDrawingData() {
        try {
            const drawingData = canvas.toJSON()
            // console.log(drawingData)
            // console.log(canvas)
            const response = await window.electron.createDrawingData({
                token,
                userId : currentUser.id,
                drawingData
            })
            if (response.error) {
                alertAndLog(response.error, "error")
              }
            else{
                alertAndLog(response.message, 'success')
            }
           
        }
        catch(e) {
            showAlert("Unexpected error occurs", "error")
        }
    }


    function editBoard() {
        if (currentUser.mode === "Online") {
            editBoardOnline()
        }
        else{
           editBoard_()
        }
    }

    async function editBoardOnline(){

        try{
            const drawingData = canvas.toJSON()
            console.log(drawingData)
            const jsonString = JSON.stringify(drawingData);
            const sizeInBytes = new Blob([jsonString]).size; // Get size in bytes
            const sizeInKB = sizeInBytes / 1024; // Convert to KB
            //const sizeInMB = sizeInKB / 1024; // Convert to MB
            console.log(sizeInKB)
            const res = await axios.put(`http://localhost:7000/drawingBoard`, {
                drawingData
            })
            showAlert(res.data.message, "success")
        }
        
        catch(e) {
            if(e.response) {   
              if(e.response.data.ServerErrorMsg) {  
                console.log(e.response.data.ServerErrorMsg)
                //alertAndLog(e.response.data.ServerErrorMsg, "error")
              }
              else {
                console.log(e.message)   
                //alertAndLog(e.message, "error")
              }
            }
            else{  
              console.log(e)
            } 
        }
    }


    async function editBoard_() {
        try {
            const drawingData = canvas.toJSON()
            // console.log(drawingData)
            // console.log(canvas)
            const response = await window.electron.editDrawingData({
                token,
                userId : currentUser.id,
                drawingData
            })
            if (response.error) {
                alertAndLog(response.error, "error")
              }
            else{
                alertAndLog(response.message, 'success')
            }
           
        }
        catch(e) {
            showAlert("Unexpected error occurs", "error")
        }
    }
    
    return (
        <div className="drawing-page">
            {!canvas && 
              <button onClick={initializeCanvas} >
              click
          </button>
            }
        
            <canvas className="drawing-board" id="canvas" ref={canvasRef}></canvas>
            
            <DrawingBoardSetting canvas={canvas}></DrawingBoardSetting>
            {
                isEditing? (
                    <button className="board-save" onClick={editBoard}>Save data</button>
                ) 
                : (
                    <button className="board-save" onClick={saveBoard}>Save</button>
                )
            }
            <div className="canvas-setting">
            <label>Width: </label>
                <input
                    type="number"
                    name="width"
                    value={canvasSize.width}
                    onChange={handleResizeChange}
                />
                <label>Height: </label>
                <input
                    type="number"
                    name="height"
                    value={canvasSize.height}
                    onChange={handleResizeChange}
                />
            </div>
            <div className="tools-bar">
                <button  onClick={addRectangle}>
                    <SquareIcon></SquareIcon>
                </button>
                <button onClick={addCircle}>
                    <CircleIcon></CircleIcon>
                </button>
                <button id="drawing" className="toggle-btn" onClick={toggleDrawingMode}>
                    <Pencil1Icon></Pencil1Icon>
                </button>
            </div>
        </div>
    )
}

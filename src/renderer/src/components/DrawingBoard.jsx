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
    const {  showAlert } = useContext(GlobalContext);
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
    
        try {
            const res = await axios.get("http://localhost:7000/drawingBoard");
    
            if (res.data) {
                //console.log("Fetched Data:", res.data.drawingData);
                setIsEditing(true)
    
                await inintCanvas.loadFromJSON(res.data.drawingData)

                inintCanvas.renderAll();
                 
            }
        } catch (e) {
            console.error("Error loading drawing data:", e.response?.data?.ServerErrorMsg || e.message);
        }
    
        setCanvas(inintCanvas);
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

    async function saveBoard(){

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


    async function editBoard(){

        try{
            const drawingData = canvas.toJSON()
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

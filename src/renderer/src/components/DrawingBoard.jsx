import { useEffect, useRef, useState } from "react"
import { Canvas, Rect, Circle, PencilBrush} from "fabric"
//import fabric from 'fabric'
import '../styles/drawingBoard.scss'
import { SquareIcon, CircleIcon } from "sebikostudio-icons"
import DrawingBoardSetting from "./DrawingBoardSetting"



export default function DrawingBoard() {

    const canvasRef = useRef(null)

    const [canvas, setCanvas] = useState(null)
    const [canvasSize, setCanvasSize ] = useState({ width : 500, height : 500})

    useEffect(() => {
        if (canvasRef.current) {
            const inintCanvas = new Canvas(canvasRef.current, {
                width : canvasSize.width,
                height : canvasSize.height,
                isDrawingMode : false
            });
            
            inintCanvas.backgroundColor = "aliceblue"
            inintCanvas.freeDrawingBrush = new PencilBrush(inintCanvas)
            inintCanvas.freeDrawingBrush.color = "#000000"
            inintCanvas.renderAll()
            setCanvas(inintCanvas)

            return () => {
                inintCanvas.dispose()
            }  
        }
    } ,[])

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

            canvas.current.renderAll();
        }
    }

    function handleResizeChange(event) {
        const { name, value } = event.target;
        const newSize = { ...canvasSize, [name]: Number(value) };
        setCanvasSize(newSize);

        resizeCanvas(newSize.width, newSize.height);
    }

    
    return (
        <div className="drawing-page">
            
            <canvas className="drawing-board" id="canvas" ref={canvasRef}></canvas>
            <DrawingBoardSetting canvas={canvas}></DrawingBoardSetting>
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
                    D
                </button>
            </div>
        </div>
    )
}

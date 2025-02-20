/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import '../styles/DrawingBoardSetting.scss'


export default function DrawingBoardSetting({canvas}) {

    const [selectedObject, setSelectedObject] = useState(null);
    const [ color, setColor] = useState("")


    useEffect(() => {
        console.log('effect')
        if (canvas) {
            canvas.on('selection:created', (e) => {
                handleObjectSelection(e.selected[0])
            })

            canvas.on('selection:updated', (e) => {
                handleObjectSelection(e.selected[0])
            })

            canvas.on('selection:cleared', () => {
                setSelectedObject(null)
                clearSettings()
            })

            canvas.on('object:modified', (e) => {
                handleObjectSelection(e.target)
            })
        }
    }, [canvas])

    function handleObjectSelection(object) {
        if (!object) return
        console.log('selecyed')
        setSelectedObject(object)
        setColor(object.fill)
    }

   function clearSettings() {
        setColor("")  
    }


    function handleColorChange(e) {
        const value = e.target.value   
        setColor(value)
        
        if (selectedObject.type === 'rect' || selectedObject.type === 'circle') {
            
            selectedObject.set({fill : value})
            canvas.renderAll()
        }
        else {
            //console.log(selectedObject.stroke)
            selectedObject.set({stroke : value})
            canvas.renderAll()
        }
    }

    
    return (
        <div>
            {selectedObject && (
                <div className="settings">
                    {selectedObject.type === "path"? selectedObject.stroke : selectedObject.fill}
                   <input 

                    value={color}
                    onChange={handleColorChange}
                    type="color"
                    /> 
                </div>
            )
        }
        </div>
    )
}

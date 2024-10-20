import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Place } from "./vite-env"
import { faBomb, faFlag, faQuestion } from "@fortawesome/free-solid-svg-icons"
import React from "react"

import "./assets/App.css"

// diff: number
const generateMap = (diff: number)=>{ 
  let placeList: Place[] = []

  for(let i=0; i<(diff*8)*(diff*8); i++){
    let place: Place = {
      _id: `${Math.random()}`,
      number: 0,
      bomb: false,
      state: "hide",
    }
    placeList.push(place)
  }

  // addBombs 
  for(let i=0; i<diff*diff*50; i++){
    let index = Math.floor(Math.random() * ((diff*8)*(diff*8)+1))
    while(!placeList[index] || placeList[index].bomb === true) {
      index = Math.floor(Math.random() * ((diff*8)*(diff*8)+1))
    }
    if(placeList[index]) placeList[index].bomb = true
    ///checkSurrounding 
    for(let j=1; j<= 8;j++) {
      let multiply = j < 4 ? -1 : j > 5 ? 1 : 0
      let add= j === 1 || j === 4 || j === 6 ? -1 : j=== 3 || j === 5 || j === 8 ? +1 : 0

      if((index % (diff*8) === 0 && add === -1)
      || ((index+1) % (diff*8) === 0 && add === +1)) continue
      let secIndex = index + (8 * multiply) + add
      if(placeList[secIndex]) placeList[secIndex].number++
    }
  }

  return placeList
}

export default function App() {
  let diff: number = 1
  let bombs = diff*diff*10
  const [gameState, setGameState] = React.useState<boolean>(false)
  const [currentMap, setCurrentMap] = React.useState<Place[] | undefined>(undefined)
  const [gameConfig, setGameConfig] = React.useState()

  const viewPlace = (id: string) => {
    if(currentMap) setCurrentMap(currentMap.map(el => {
      if (el._id !== id) return el
      else return { ...el, state: "view" }
    }))
  }

  const placeContent: { [key: string]: any } = {
    "hide" : null , "flag": faFlag, "question" : faQuestion
  }

  React.useEffect(()=>{
    if(currentMap === undefined) setCurrentMap(generateMap(diff))
  })

  const colorScale = ["",
    "#548CCD", "#65BFA7", "#7EB753", "#E5D741", "#F2AF44", "#FA8343", "#FC5845", "#FF457D"
  ]

  return <main>
    <section className="map"
      style={{gridTemplateColumns: `repeat(${(diff*8)}, 50px)`}}
    >
      {currentMap && currentMap.map((el, i) => {
        return <button
          key={Math.random()}
          onClick={() => { viewPlace(el._id) }}
          style={{backgroundColor:el.bomb ? "" :  colorScale[el.number]}}
        >
          {
          // el.state === "view" ?
            el.bomb ? <FontAwesomeIcon icon={faBomb} /> :el.number
            // : placeContent[el.state]
          }
        </button>
      })}
    </section>
  </main>

}

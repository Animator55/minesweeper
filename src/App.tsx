import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Place } from "./vite-env"
import { faBomb, faFlag, faQuestion } from "@fortawesome/free-solid-svg-icons"
import React from "react"

import "./assets/App.css"

// diff: number
const generateMap = (diff: number) => {
  let placeList: Place[] = []

  for (let i = 0; i < (diff * 8) * (diff * 8); i++) {
    let place: Place = {
      _id: `${Math.random()}`,
      number: 0,
      bomb: false,
      state: "hide",
    }
    placeList.push(place)
  }

  // addBombs 
  for (let i = 0; i < diff * diff * 10; i++) {
    let index = Math.floor(Math.random() * ((diff * 8) * (diff * 8) + 1))
    while (!placeList[index] || placeList[index].bomb === true) {
      index = Math.floor(Math.random() * ((diff * 8) * (diff * 8) + 1))
    }
    if (placeList[index]) placeList[index].bomb = true
    ///checkSurrounding 
    for (let j = 1; j <= 8; j++) {
      let multiply = j < 4 ? -1 : j > 5 ? 1 : 0
      let add = j === 1 || j === 4 || j === 6 ? -1 : j === 3 || j === 5 || j === 8 ? +1 : 0

      if ((index % (diff * 8) === 0 && add === -1)
        || ((index + 1) % (diff * 8) === 0 && add === +1)) continue
      let secIndex = index + (8 * multiply) + add
      if (placeList[secIndex]) placeList[secIndex].number++
    }
  }

  return placeList
}

export default function App() {
  let diff: number = 1
  let bombs = diff * diff * 10
  const [gameState, setGameState] = React.useState<boolean>(false)
  const [currentMap, setCurrentMap] = React.useState<Place[] | undefined>(undefined)
  const [flags, setFlags] = React.useState(bombs)
  const [gameConfig, setGameConfig] = React.useState()

  const placeFlag = (e: React.MouseEvent<HTMLButtonElement>, id: string, currentState: string)=>{
    e.preventDefault()
    if (!currentMap || (flags === 0 && currentState === "hide")) return

    const flagSelector: {[key:string]: string} = {
      "hide": "flag", "flag": "question", "question": "hide"
    }

    let result = currentMap.map((el) => {
      if (el._id !== id) return el
      else {
        if(el.state === "hide") setFlags(flags - 1)
        else if(el.state === "flag") setFlags(flags + 1)
        return { ...el, state: flagSelector[el.state]}
      }
    }) as Place[]
    setCurrentMap(result)

  }

  const viewPlace = (id: string) => {
    if (!currentMap) return
    let number = -1
    let index = -1
    let bomb = false

    let result = currentMap.map((el, i) => {
      if (el._id !== id) return el
      else {
        number = el.number
        bomb = el.bomb
        index = i
        return { ...el, state: "view" }
      }
    }) as Place[]
    setCurrentMap(result)
    if (number !== 0 || bomb) return
    const boardSize = diff*8; 

    const checkSurroundingsOfZero = (subI: number, resultCurrent: Place[]) => {
      let resultLocal = resultCurrent;
      let stack: number[] = [subI]
      let visited: Set<number> = new Set()

      while (stack.length > 0) {
        let current = stack.pop();
        if(current === undefined) continue

        if (visited.has(current)) continue;
        visited.add(current);

        let currentRow = Math.floor(current / boardSize);
        let currentCol = current % boardSize;

        for (let j = 1; j < 9; j++) {
          let rowOffset = j < 4 ? -1 : j > 5 ? 1 : 0; 
          let colOffset = j === 1 || j === 4 || j === 6 ? -1 : j === 3 || j === 5 || j === 8 ? +1 : 0; 

          let newRow = currentRow + rowOffset;
          let newCol = currentCol + colOffset;

          if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) continue

          let secIndex = newRow * boardSize + newCol;

          if (!resultLocal[secIndex]) continue; 

          if (resultLocal[secIndex].state === "hide") resultLocal[secIndex].state = "view"

          if (resultLocal[secIndex].number === 0 && !resultLocal[secIndex].bomb) stack.push(secIndex)
        }
      }
    }

    checkSurroundingsOfZero(index, result);
    setCurrentMap(result);
  }

  const placeContent: { [key: string]: any } = {
    "flag": faFlag, "question": faQuestion
  }

  React.useEffect(() => {
    if (currentMap === undefined) setCurrentMap(generateMap(diff))
  })

  const colorScale = ["",
    "#548CCD", "#65BFA7", "#7EB753", "#E5D741", "#F2AF44", "#FA8343", "#FC5845", "#FF457D"
  ]

  return <main>
    <header>
      <div>{flags}</div>
    </header>
    <section className="map"
      style={{ gridTemplateColumns: `repeat(${(diff * 8)}, 50px)` }}
    >
      {currentMap && currentMap.map((el, i) => {
        return <button
          key={Math.random()}
          className={el.state}
          onClick={() => { if(el.state === "hide")viewPlace(el._id) }}
          onContextMenu={(e)=>{ if(el.state !== "view")placeFlag(e, el._id, el.state) }}
          style={el.state === "view" ? { backgroundColor: el.bomb ? "red" : colorScale[el.number] } : {}}
        >
          {
            el.state === "view" ?
            el.bomb ? <FontAwesomeIcon icon={faBomb} /> : el.number === 0 ? "" : el.number
            : el.state !== "hide" && <FontAwesomeIcon icon={placeContent[el.state]} />
          }
        </button>
      })}
    </section>
  </main>

}

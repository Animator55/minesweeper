import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Place } from "./vite-env"
import { faArrowPointer, faBomb, faFlag, faQuestion } from "@fortawesome/free-solid-svg-icons"
import React from "react"

import "./assets/App.css"

const checkSurroundings = (index: number, diff: number) => {
  let result = []

  for (let j = 1; j <= 8; j++) {
    let multiply = j < 4 ? -1 : j > 5 ? 1 : 0
    let add = j === 1 || j === 4 || j === 6 ? -1 : j === 3 || j === 5 || j === 8 ? +1 : 0

    if ((index % (diff * 8) === 0 && add === -1)
      || ((index + 1) % (diff * 8) === 0 && add === +1)) continue
    let secIndex = index + (8 * multiply) + add
    result.push(secIndex)
  }

  return result
}

// diff: number
const generateMap = (diff: number, inmune: number) => {
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
  for (let i = 0; i < diff * 10; i++) {
    let index = Math.floor(Math.random() * ((diff * 8) * (diff * 8) + 1))
    while (!placeList[index]
      || placeList[index].bomb === true
      || index === inmune
      || checkSurroundings(index, diff).includes(inmune)) {
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
let start = -1

export default function App() {
  let diff: number = 1
  let bombs = diff * diff * 10
  const [tool, setTool] = React.useState("normal")
  const [gameState, setGameState] = React.useState<boolean>(false)
  const [currentMap, setCurrentMap] = React.useState<Place[] | undefined>(undefined)
  const [flags, setFlags] = React.useState(bombs)
  const points = React.useRef<HTMLDivElement | null>(null);
  const title = React.useRef<HTMLDivElement | null>(null);

  const tools: {[key:string]:any} = {
    "normal": faArrowPointer, "flag": faFlag
  }

  const placeFlag = (e: React.MouseEvent<HTMLButtonElement>, id: string, currentState: string) => {
    e.preventDefault()
    if (!currentMap || (flags === 0 && currentState === "hide")) return

    const flagSelector: { [key: string]: string } = {
      "hide": "flag", "flag": "question", "question": "hide"
    }

    
    let result = currentMap.map((el) => {
      if (el._id !== id) return el
      else {
        console.log(el.state)
        if (el.state === "hide") setFlags(flags - 1)
        else if (el.state === "flag") setFlags(flags + 1)
        return { ...el, state: flagSelector[el.state] }
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
    if (bomb) {
      if (title.current) title.current.textContent = "You Lose"
      setGameState(false)
    }
    if (number !== 0 || bomb) return
    const boardSize = diff * 8;

    const checkSurroundingsOfZero = (subI: number, resultCurrent: Place[]) => {
      let resultLocal = resultCurrent;
      let stack: number[] = [subI]
      let visited: Set<number> = new Set()

      while (stack.length > 0) {
        let current = stack.pop();
        if (current === undefined) continue

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

  const colorScale = ["", "#65BFA7", "#7EB753", "#E5D741", "#F2AF44", "#FA8343", "#FC5845", "#FF457D", "#fb35d8"
  ]

  React.useEffect(() => {
    if (!currentMap) {
      let map = document.querySelector(".map") as HTMLDivElement
      if(map) map.classList.add("fade")
      return
    }
    if (start !== -1) {
      viewPlace(currentMap[start]._id)
      start = -1
    }
    let hide = document.querySelector(".hide")
    let question = document.querySelector(".question")
    if (hide === null && question === null && gameState) {
      setGameState(false)
      if (title.current && points.current
        && points.current.textContent !== null) {
        title.current.textContent = "You Win"
        if(title.current.nextSibling) title.current.nextSibling.textContent = "Score: "+points.current.textContent
      }
    }
  })

  React.useEffect(() => {
    if (!gameState) return
    if (!points.current) return
    if (title.current) title.current.textContent = ""
    points.current.textContent = "0"
    const interval = setInterval(() => {
      if (points.current
        && points.current.textContent !== null) points.current.textContent = `${parseInt(points.current.textContent) + 1}`
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState])

  let fakeMap = []
  if (!currentMap) {
    for (let i = 0; i < (diff * 8) * (diff * 8); i++) {
      fakeMap.push(<button
        key={Math.random()}
        className="hide"
        onClick={() => {
          setCurrentMap(generateMap(diff, i)); start = i
          setGameState(true)
        }}
      >
      </button>)
    }
  }

  const reset = () => {
    if (points.current) points.current.textContent = "0"
      if (title.current && points.current
        && points.current.textContent !== null) {
        title.current.textContent = ""
        if(title.current.nextSibling) title.current.nextSibling.textContent = ""
      }
    setTool("normal")
    setGameState(false)
    setFlags(diff * diff * 10)
    setCurrentMap(undefined)
  }

  return <main>
    <section className="pop">
      <section className="content">
        <div className="title" ref={title}></div>
        <p></p>
        <button className="button" onClick={reset}>Reset</button>
      </section>
    </section>
    <header>
      <div className="numbers"><FontAwesomeIcon icon={faFlag}/><p>{flags}</p></div>
      <button className="button" onClick={reset}>Reset</button>
      <div className="numbers" ref={points}></div>
    </header>
    <section className="map"
      key={Math.random()}
      style={{ gridTemplateColumns: `repeat(${(8)}, ${100/8}%)`}}
    >
      {currentMap ? currentMap.map((el) => {
        return <button
          key={Math.random()}
          className={el.state}
          onClick={(e) => { 
            if (gameState) {
              if(tool === "normal" && el.state === "hide") viewPlace(el._id) 
              else if(tool === "flag" && el.state !== "view")placeFlag(e, el._id, el.state)
            }
            }}
          onContextMenu={(e) => { if (gameState && el.state !== "view" && tool === "normal") placeFlag(e, el._id, el.state) }}
          style={el.state === "view" ? { 
            color: el.bomb ? "red" : colorScale[el.number],
            borderColor: el.bomb ? "red" : colorScale[el.number]
          } : {}}
        >
          {
            el.state === "view" ?
              el.bomb ? <FontAwesomeIcon icon={faBomb} /> : el.number === 0 ? "" : <h3>{el.number}</h3>
              : el.state !== "hide" && <FontAwesomeIcon icon={placeContent[el.state]} />
          }
        </button>
      }) : fakeMap
      }
    </section>
    <div className="tool-selector">
      {Object.keys(tools).map(el=>{
        return <button
          key={Math.random()}
          className={el === tool ? "active" : ""}
          onClick={()=>{setTool(el)}}
        >
          <FontAwesomeIcon icon={tools[el]}/>
        </button>
      })}
    </div>
  </main>

}

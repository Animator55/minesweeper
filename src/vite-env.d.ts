/// <reference types="vite/client" />



export type Place = {
    _id: string
    number: 0 | 1 | 2 | 3| 4 | 5 | 6| 7 | 8 | 9
    bomb: boolean
    state: "view" | "hide" | "flag" | "question"
}

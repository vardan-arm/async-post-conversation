import React, {useEffect} from "react";

export const MainContainer = () => {
  useEffect(() => {
    alert('asdf')
  }, [])

  return (
    <div>
      <div>In Web app</div>
      <div style={{border: '1px solid', background: 'lightblue'}}>Other text</div>
    </div>
  )
}

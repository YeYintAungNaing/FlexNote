export default function Setting() {

  function current() {
    try{
      const token = window.localStorage.getItem('sessionToken');
    console.log(token)
    }catch(e) {
        console.log(e)
      }
    }
    
  return (

    <div>
      <button onClick={current}>Current token</button>
    </div>
  )
}

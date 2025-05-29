import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Homepage = () => {
      const navigate = useNavigate();
    useEffect(()=>{
        navigate('/documents');
    },[])

  return (
    <div>Homepage</div>
  )
}

export default Homepage
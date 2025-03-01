import { Component } from "react"
import Doctors from "../Doctors"

import "./index.css"
class DoctorsList extends Component{
    componentDidMount(){
       
    } 
    render(){
        const {listOfDoctors} = this.props.listOfDoctors
        console.log("ssssss")
        console.log("result: ",listOfDoctors  )
        return(
          <>

          <ul className="unorder-list-of-doctor">
            {
                listOfDoctors.map((eachDoc) => (
                    <Doctors key = {eachDoc.id} detailsOfDoctor = {eachDoc} />
                ))
            }
           </ul>
            
          </>
        )
    }
}

export default DoctorsList
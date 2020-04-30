import React, {Component} from 'react';
import axios from 'axios';

class HostAddRoom extends Component {

    state = {
        price: '',
        type: '',
        maxguest: '',
        addr: '',
        status: '',
        cities: [],
        states: [],
        countries: [],
        city: '',
        state: '',
        country: ''
    }

    componentDidMount() {
        axios.get('http://localhost:3001/getlocations')
                .then((response) => {
                    console.log(response);
                    this.setState({ locations: response.data });
                    this.setState({ cities: response.data[0]});
                    this.setState({ states: response.data[1]});
                    this.setState({ countries: response.data[2]});
            });
    }

    onChangeInput = (e) => {
        this.setState({ [e.target.name]: e.target.value});
    }

    onSubmitProfile = (e) => {
        e.preventDefault();
        //http call to updateprofile
        const data = {
            price : this.state.price,
            type : this.state.type,
            maxguest: this.state.maxguest,
            addr: this.state.addr,
            status: this.state.status,
            city: this.state.city,
            state: this.state.state,
            country: this.state.country
        }
        //set the with credentials to true
        axios.defaults.withCredentials = true;
        //make a post request with the user data
        console.log(data);
        axios.post('http://localhost:3001/addroom',data)
            .then(response => {
                console.log("Status Code : ",response.status);
                response.status === 200 ? this.setState({ authflag: true }) : this.setState({ authflag: false });
            });
    }
    

    render() {
        let submitstatus = this.state.authflag ? 'Room Added!' : '';
        return(
            <div>
                <br/>
                <div className="container">
                    <h3>Add New Room</h3>
                    <br/>
                    
                    <div style={{width: '30%'}} className="form-group">
                        <p>Price: </p>
                        <input  onChange = {this.onChangeInput} type="text" className="form-control" name="price" placeholder="price" />
                    </div>
                    <div style={{width: '30%'}} className="form-group">
                        <p>Type: </p>
                        <input  onChange = {this.onChangeInput} type="text" className="form-control" name="type" placeholder="type" />
                    </div>
                    <div style={{width: '30%'}} className="form-group">
                        <p>Max Guest: </p>
                        <input  onChange = {this.onChangeInput} type="text" className="form-control" name="maxguest" placeholder="max guest" />
                    </div>
                    <div style={{width: '30%'}} className="form-group">
                        <p>Address: </p>
                        <input  onChange = {this.onChangeInput} type="text" className="form-control" name="addr" placeholder="address" />
                    </div>
                    <div style={{width: '30%'}} className="form-group">
                        <p>Status: </p>
                        <input  onChange = {this.onChangeInput} type="text" className="form-control" name="status" placeholder="status" />
                    </div>
                    <div style={{width: '30%'}} className="form-group">
                        <p>City: </p>
                        <select onChange = {this.onChangeInput} name="city" defaultValue="">
                            <option value=""></option>
                            {this.state.cities.map((c) => (

                                <React.Fragment key={c.R_City}>
                                  <option value={c.R_City}>{c.R_City}</option>
                                </React.Fragment>
                            ))}
                        </select>
                    </div>
                    <div style={{width: '30%'}} className="form-group">
                        <p>State: </p>
                        <select onChange = {this.onChangeInput} name="state" defaultValue="">
                            <option value=""></option>
                            {this.state.states.map((c) => (

                                <React.Fragment key={c.R_State}>
                                  <option value={c.R_State}>{c.R_State}</option>
                                </React.Fragment>
                            ))}
                        </select>
                    </div>
                    <div style={{width: '30%'}} className="form-group">
                        <p>Country: </p>
                        <select onChange = {this.onChangeInput} name="country" defaultValue="">
                            <option value=""></option>
                            {this.state.countries.map((c) => (

                                <React.Fragment key={c.R_Country}>
                                  <option value={c.R_Country}>{c.R_Country}</option>
                                </React.Fragment>
                            ))}
                        </select>
                    </div>
                    <br/>
                    <div style={{width: '30%'}}>
                        <button onClick = {this.onSubmitProfile}  className="btn btn-success" type="submit">Submit</button>
                        {submitstatus}
                    </div> 
                </div>
            </div>
        )
    }
}

export default HostAddRoom;
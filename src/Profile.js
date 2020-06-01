import React, { Component } from 'react';
import * as api from './api'
import {
  Person,
} from 'blockstack';
import MarkdownEditor from '@uiw/react-md-editor';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Profile extends Component {
  constructor(props) {
    super(props);


  	this.state = {
  	  person: {
  	  	name() {
          return 'Anonymous';
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage;
  	  	},
  	  },
      username:"",
      newText:"",
      currentDocument:[],
      docHistory:[],
      markdown:[],
      docmarkdown:[],
      timestamp: '',
      isLoading: false,
      showing: false,
      showing2: false,
      showing3: false,
      docList:[],
      currentDocIndex:0
    };
    this.updateMarkdown = this.updateMarkdown.bind(this);
  }

  render() {
    const { handleSignOut, userSession } = this.props;
    const { person } = this.state;
    const { showing } = this.state;
    const { showing2 } = this.state;
    const { showing3 } = this.state;

    return (
      !userSession.isSignInPending() ?

      <div classname="mainsection">

        <div classname="menu-container">
          <a className="button" onClick={() => this.setState({ showing2: !showing2 })}>
            <img src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="profile-button" id="avatar-image" alt=""/>
          </a>
          <div id="popup2" className="overlay" style={{display: (showing2 ? 'block' : 'none')}}>
              <button onClick={e=>this.saveNewText(e)}>Save</button>
              <button onclick={e=>this.restoreDoc(e)}>restore</button>
              <button>SwapDocument</button>
              <button onclick={() => this.setState({ showing3: !showing3 })}>NewDocument</button>
              <button>History</button>
          </div>
          <div className="overlay" style={{display: (showing3 ? 'block' : 'none')}}>
            <textarea id='newSave'></textarea>
            <button>save</button>
          </div>
        </div>


        <div className="profile-container">
          <a className="button" onClick={() => this.setState({ showing: !showing })}>
            <img src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="profile-button" id="avatar-image" alt=""/>
          </a>
          <div id="popup1" className="overlay" style={{display: (showing ? 'block' : 'none')}}>
              <div className="panel-welcome" id="section-2">
                <div className="avatar-section">
                  <img src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage } className="img-rounded avatar" id="avatar-image" alt=""/>
                  <div className="username">
                    <h4>
                      <span id="heading-name">{ person.name() ? person.name()
                        : 'Nameless Person'}</span>
                    </h4>
                  <span>{this.state.username}</span>
                  </div>
                </div>
                <p className="lead">
                  <button
                    className="btn btn-primary btn-lg"
                    id="signout-button"
                    onClick={ handleSignOut.bind(this) }>
                    SignOut
                    </button>
                </p>
              </div>
          </div>
        </div>


        <div className="work-space">
          <h2>
            Welcome to PaperState!
          </h2>
          <p>
            Lasted updated: {this.state.currentDocument.created_at ? new Date(this.state.currentDocument.created_at).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: true,
              timeZoneName: 'short'
            }) : "No File yet"}
          </p>
        </div>

        <div id="section-3">

          <div id="Text-section">

          <div id="Text-section">
              <MarkdownEditor
                id="marksection"
                value={this.state.markdown}
                onChange={e=>this.updateMarkdown(e)}
              />

          </div>

          <div>
            <h4>History</h4>
            <p>
              <div id="history" className="history">
                {JSON.stringify(this.state.docHistory)}
                
                
              </div>
              
            </p>

          </div>


          </div>

        </div>

      </div>:null
    );
  }

  updateMarkdown(event) {
    this.setState({ markdown:event})
  }

  saveNewText() {

    let newDocument = {
      md: this.state.markdown,
      created_at: Date.now()
    }

    const options = { encrypt: true }
    this.props.userSession.putFile('Document.json', JSON.stringify(newDocument), options)
    .then(() => {
      this.setState({
        currentDocument:newDocument
      })
    })
    this.state.docHistory.push(this.state.currentDocument)
    
    console.log(this.state.docHistory)

    this.props.userSession.putFile('Hist.json', JSON.stringify(this.state.docHistory), options)
   }



  loadNewText() {
      const options = { decrypt: true }
      this.props.userSession.getFile('Document.json', options)
      .then((file) => {
        if(file) {
          const docFile = JSON.parse(file);
          this.setState({
            currentDocument:docFile,
            markdown:docFile.md
          });
        }
      })
    }
    loadHistory() {
      const options = { decrypt: true }
      this.props.userSession.getFile('Hist.json', options)
      .then((file) => {
        if(file) {
          const docFile = JSON.parse(file);
          this.setState({
            docHistory:docFile,
            docmarkdown:docFile.md
          });
        }
      })
    }


  restoreDoc(event){
    this.setState({
      markdown:this.state.currentDocument.md
    })
  }
  componentWillMount() {
    const { userSession } = this.props
    this.setState({
      person: new Person(userSession.loadUserData().profile),
      username: userSession.loadUserData().username
    });
    this.loadNewText();
    this.loadHistory();

   }



   loadList(){
     const options = { decrypt: true }
     this.props.userSession.getFile('List.json', options)
     .then((file) => {
       if(file) {
         const docFile = JSON.parse(file);
         this.setState({
           docList:docFile
         });
       }
     })
   }

   addToList(){
   }
  handleChange(event) {
   this.setState({newText: event.target.value});
  }


}

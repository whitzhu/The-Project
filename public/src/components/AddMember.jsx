import React from 'react';

class AddMember extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.initialMemberSelect();
  }

  render() {

    return (
      <div>
        {this.props.memberExist ? <p>The name already exist!</p> : null}
        <div className='receipt-members-bar flex-container-horizontal'>
          <div className='flex-container-horizontal'>
            {this.props.members.map((member, index) => {
              return (
                <span
                  key={index}
                  onClick={() => this.props.memberOnClick(member[0])}
                  className={'receipt-members-bar-mem selectMember' + (this.props.selectMember === member[0] ? 'Selected' : '')}
                >{member[0]}</span>
              )
            })}
            <input
              placeholder='Name'
              name='member'
              type='text'
              value={this.props.member}
              id='input-member'
              onChange={this.props.onInputChange}
            />
            <a
              onClick={this.props.addMember}
              className='btn-circle'
            ></a>
          </div>
        </div>
      </div>
    )

  }
}

export default AddMember;

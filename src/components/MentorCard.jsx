import React from 'react';

const MentorCard = ({ name, role, company, imageUrl }) => {
  return (
    <div className="mentor-card">
      <img src={imageUrl || "https://via.placeholder.com/320x160"} alt={name} />
      <div className="card-body">
        <h3>{name}</h3>
        <p>{role}</p>
        <span className="company-chip">{company}</span>
      </div>
    </div>
  );
};

export default MentorCard;
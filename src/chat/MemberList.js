export default function MemberList({ members }) {
  return (
    <div>
      <h3>Members</h3>
      <div className="card">
        {members.map((member, i) => (
          <div className="member" key={i}>
            {member.user.name}
          </div>
        ))}
      </div>
    </div>
  );
}

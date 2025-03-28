import '../components/SalesTeam/SalesTeam.css';
import TeamsTable from '../components/SalesTeam/TeamsTable';
import RegisterEmployee  from '../components/SalesTeam/RegisterEmployee';

export default function SalesTeam() {
  return (
    <>
      <div className='salesteam-page-container'>
        <div className="salesteam-header-text">Sales Team</div>

        <div className="salesteam-horizontal-alignment">
          <TeamsTable />
          <RegisterEmployee />
        </div>

        <div className="onboarded-salesteam-grid-container">
          <div className="onboarded-salesteam-grid-large">
          </div>
          <div className="onboarded-salesteam-grid-small">
          </div>
        </div>

        <div className="clickthrough-salesteam-grid-container">
          <div className="clickthrough-salesteam-grid-large">
          </div>
          <div className="clickthrough-salesteam-grid-small">
          </div>
        </div>
       
      </div>
    </>
  );
}

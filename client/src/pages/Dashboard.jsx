import '../components/Dashboard/Dashboard.css';
import LeadsTable from '../components/Dashboard/LeadsTable';
import CircularProgressChart from '../components/Dashboard/CircularProgressChart';
import OnboardedClientsChart from '../components/Dashboard/OnboardedClientsChart';
import ProjectSummaryCards from '../components/Dashboard/ProjectSummaryCards'; 
import ClickThroughRate from '../components/Dashboard/ClickThroughRate';
import HandlingResponse from '../components/Dashboard/HandlingResponse'; 

export default function Dashboard() {
  return (
    <>
      <div className='dashboard-page-container'>
        <div className="dashboard-header-text">Dashboard</div>

        <div className="dashboard-horizontal-alignment">
          <LeadsTable />
          <CircularProgressChart />
        </div>

        <div className="onboarded-dashboard-grid-container">
          <div className="onboarded-dashboard-grid-large">
            <OnboardedClientsChart />
          </div>
          <div className="onboarded-dashboard-grid-small">
            <ProjectSummaryCards />
          </div>
        </div>

        <div className="clickthrough-dashboard-grid-container">
          <div className="clickthrough-dashboard-grid-large">
            <ClickThroughRate />
          </div>
          <div className="clickthrough-dashboard-grid-small">
            <HandlingResponse  />
          </div>
        </div>
       
      </div>
    </>
  );
}

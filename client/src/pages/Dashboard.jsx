import '../components/Dashboard/Dashboard.css';
import LeadsTable from '../components/Dashboard/LeadsTable';
import CircularProgressChart from '../components/Dashboard/CircularProgressChart';

export default function Dashboard() {
  return (
    <>
      <div className='dashboard-page-container'>
        <div className="dashboard-header-text">Dashboard</div>
        <div className="dashboard-horizontal-alignment">
          <LeadsTable />
          <CircularProgressChart />
        </div>
      </div>
    </>
  )
}

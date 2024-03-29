import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { ApiService } from './services/api.service'
import { Report } from './interfaces/interfaces'
import { DialogComponent } from './components/dialog/dialog.component'
import { downloadObjectAsJson } from './helpers/json'
import { MediaObserver } from '@angular/flex-layout'

export interface Filter {
  name: string
  icon: string
  color: string
  completed?: boolean | null
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  faGithub = faGithub
  files: FileList
  loading = false
  uploading = false
  reports: Report[] = []
  currentReport: Report
  filters: Filter[] = [
    { name: 'Bandeja de entrada', icon: 'inbox', color: 'firebrick', completed: false },
    { name: 'Completados', icon: 'assignment_turned_in', color: 'green', completed: true },
    { name: 'Todos los informes', icon: 'all_inbox', color: 'dodgerblue', completed: null },
  ]
  currentFilter: Filter = this.filters[0]

  constructor(
    private api: ApiService,
    public dialog: MatDialog,
    public mediaObserver: MediaObserver,
  ) { }

  ngOnInit() {
    this.getReports(this.currentFilter)
  }

  openVideoTutorial(){
    window.open('https://youtu.be/uXfAtjK_MqA');
  }

  goToThisGithubRepo(): void {
    window.open('https://github.com/TeMU-BSC/ictusnet')
  }

  uploadReports(event: Event): void {
    this.uploading = true
    this.files = (event.target as HTMLInputElement).files
    this.api.uploadReports(this.files).subscribe(result => {
      this.uploading = false
      
      if (result.busy){
        this.dialog.open(DialogComponent, {
          data: {
            title: 'Subida en proceso',
            content: `Sus informes se han puesto en cola, estarán disponibles en unos minutos.`,
            actions: {
              accept: { text: 'Vale' }
            }
          }
        })
      }else{
        this.dialog.open(DialogComponent, {
          data: {
            title: 'Subida finalizada',
            content: `Se han procesado ${result.report_count} informes correctamente.`,
            actions: {
              accept: { text: 'Vale' }
            }
          }
        })
      }
  
      this.getReports(this.currentFilter)
    })
  }

  getReports(filter?: Filter): void {
    this.currentFilter = filter
    this.api.getReports(filter.completed).subscribe(response => {
      this.reports = response
      this.currentReport = this.reports[0]
    })
  }

  downloadAllReports(): void {
    this.api.getReports().subscribe(response => {
      const results = response
      const timestamp = new Date().toISOString()
      downloadObjectAsJson(results, `ictusnet-results-${timestamp}.json`)
    })
  }

  resetDatabase(): void {
    const confirmed = confirm('Esta es una funcionalidad de desarrollo para testear la herramienta web. ¿Seguro que quieres borrar los datos actuales en MongoDB?')
    if (confirmed) {
      this.api.resetDatabase().subscribe(response => {
        this.dialog.open(DialogComponent, {
          data: {
            title: 'Database has been reset successfully',
            content: `${response['message']}`,
            actions: {
              accept: { text: 'OK' }
            }
          }
        })
        this.getReports(this.currentFilter)
      })
    }
  }

  deleteReportRefresh(){
   this.getReports(this.currentFilter)
  }
  
  isEveryReportCompleted(): boolean {
    return this.reports.every(report => report.completed)
  }

}

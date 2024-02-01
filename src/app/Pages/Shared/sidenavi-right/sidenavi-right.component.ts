import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { RequisitionService } from 'src/app/services/requisition.service';
import { SideNavService } from 'src/app/services/sidenavi-service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { environment } from 'src/environments/environment';

export interface CommentData {
  commentId: number;
  commentType: any;
  commentData: string;
};

@Component({
  selector: 'app-sidenavi-right',
  templateUrl: './sidenavi-right.component.html',
  styleUrls: ['./sidenavi-right.component.css']
})
export class SidenaviRightComponent implements OnInit, OnDestroy {
  commentsForm: FormGroup; flag; pkey: number = 0;
  comments: any[] = [];
  commentType: string;
  getCommentType: string;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  isActive = false;
  selectedComment: any = null;
  targetLoc: string;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private sidenavService: SideNavService, private reqService: RequisitionService,
    private swal: SwalToastService, private activatedRoute: ActivatedRoute, private router: Router) { }

  get fm() { return this.commentsForm.controls }

  ngOnInit(): void {
    
    this.targetLoc = environment.location;

    this.commentsForm = this.fb.group({
      commentId: 0,
      commentType: ['', Validators.required],
      commentData: ['', Validators.required]
    });

    this.isActive = this.sidenavService.getActiveComponent();
    
    if (this.targetLoc === 'Vessel') {
      this.commentType='internal'
      this.commentsForm.patchValue({commentType:'internal'})
    } else if (this.targetLoc === 'Office') {
      this.commentType='generic'
      this.commentsForm.patchValue({commentType:'generic'})
    }

    this.loadData(0, this.commentType);

    // this.sidenavService.commentTypeChange$.subscribe((commentType: string) => {
    //   debugger
    //   this.comments = [];
    //   this.loadData(0, commentType);
    // })

  }

  ngOnDestroy(): void {

    if (!this.destroy$.isStopped) {
      this.destroy$.next();
      this.destroy$.complete();
    }
    this.sidenavService.destroySidenav();
  }

  onSubmit(form: any) {
    
    if (form.value.commentId == null) {
      form.value.commentId = 0;
    }
    if (this.commentsForm.valid) {

      this.reqService.addComments(form.value)
        .subscribe(data => {

          if (data.message == "data added") {
            this.swal.success('Added successfully.');
            this.clear();
            this.comments = [];
            this.loadData(0);
          }
          else if (data.message == "updated") {
            this.swal.success('Data has been updated successfully.');
            this.clear();
            this.comments = [];
            this.loadData(0);
          }
          else if (data.message == "duplicate") {
            this.swal.info('Data already exist. Please enter new data');
            this.comments = [];
            this.loadData(0);
          }
          else if (data.message == "not found") {
            this.swal.info('Data exist not exist');
            this.comments = [];
            this.loadData(0);
          }
          else {

          }
        },
          error => {

            console.error('Service error:', error);
          });
    } else {
      this.swal.error('Please Select Comment Type First.');
    }

  }

  loadData(status: number, commentType?: string) {

    // if (status == 1) {
    //   this.deletetooltip ='UnArchive';
    //   if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
    //     (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
    //     (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
    //   }
    // }
    // else {
    //   this.deletetooltip='Archive';
    //   if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
    //     (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
    //     (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
    //   }
    // }
    this.reqService.getComments(status)
      .subscribe(response => {        
        this.flag = status;
        var data = response.data;

        data.map(res => { this.comments.push({ commentId: res.commentId, commentData: res.commentData, commentType: res.commentType }) });
        if (this.targetLoc === 'Vessel') {
          this.comments = this.comments.filter(res => res.commentType == commentType);
        }
        // this.dataSource.data = response.data;

        // this.dataSource.sort = this.sort;
        // this.dataSource.paginator = this.paginator;
        // this.clear();
        // (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
  }

  editComment(comment: any): void {

    this.selectedComment = comment;
    this.commentsForm.patchValue({
      commentId: comment.commentId,
      commentData: comment.commentData,
      commentType: comment.commentType
    });
  }
  cancelUpdate() {
    this.commentsForm.reset();
  }

  clear() {
    this.commentsForm.reset();
    if (this.targetLoc === 'Vessel') {
      this.commentType='internal'
      this.commentsForm.patchValue({commentType:'internal'})
    } else if (this.targetLoc === 'Office') {
      this.commentType='generic'
      this.commentsForm.patchValue({commentType:'generic'})
    }
  }

  setActiveComponent(comName: boolean): void {
    this.sidenavService.setActiveComponent(comName);
    this.isActive = comName;
  }

}

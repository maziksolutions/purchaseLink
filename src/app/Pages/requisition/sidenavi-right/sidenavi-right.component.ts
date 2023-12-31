import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SideNavService } from './sidenavi-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { error } from 'console';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RequisitionService } from 'src/app/services/requisition.service';

export interface CommentData {
  commentId: number;
  commentType: any;
  commentData: string;
};

declare var SideNavi: any;
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

  private destroy$ = new Subject<void>();

  constructor(private sideNaviService: SideNavService, private fb: FormBuilder, private reqService: RequisitionService,
    private swal: SwalToastService, private activatedRoute: ActivatedRoute, private router: Router) {

    this.commentsForm = this.fb.group({
      commentId: 0,
      commentType: ['', Validators.required],
      commentData: ['', Validators.required]
    });
  }

  get fm() { return this.commentsForm.controls }

  ngOnInit(): void {
    this.loadData(0);
    this.isActive = this.sideNaviService.getActiveComponent();

    this.sideNaviService.commentTypeChange$.subscribe((commentType: string) => {

      this.comments = [];
      this.loadData(0, commentType);
    })
  }

  ngOnDestroy(): void {

    if (!this.destroy$.isStopped) {
      this.destroy$.next();
      this.destroy$.complete();
    }
    this.sideNaviService.destroySidenav();
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
        if (commentType)
          this.comments = this.comments.filter(res => res.commentType == commentType);
        // this.dataSource.data = response.data;

        // this.dataSource.sort = this.sort;
        // this.dataSource.paginator = this.paginator;
        this.clear();
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
  }

  setActiveComponent(comName: boolean): void {
    this.sideNaviService.setActiveComponent(comName);
    this.isActive = comName;
  }

}

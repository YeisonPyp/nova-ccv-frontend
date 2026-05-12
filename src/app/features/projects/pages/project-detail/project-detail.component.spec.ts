import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { gantt } from "dhtmlx-gantt";
import { ProjectDetailComponent } from "./project-detail.component";
import { ProjectService } from "@/app/core/services/projects/project.service";
import { Project, GanttData } from "@/app/core/models/projects/project.model";

const MOCK_PROJECT: Project = {
  id: 42,
  code: "PRY-001",
  name: "Test Project",
  generalObjective: "Test objective",
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  totalBudget: 100000,
  status: "ACTIVO",
  priority: "Alta",
  priorityScale: 3,
  createdAt: "2025-01-01T00:00:00Z",
};

const MOCK_GANTT: GanttData = {
  data: [
    {
      id: 1,
      text: "Activity 1",
      start_date: "2025-01-01",
      duration: 30,
      progress: 0.5,
      parent: 0,
      open: true,
    },
  ],
  links: [],
};

function buildMockService(ganttData: GanttData = MOCK_GANTT) {
  const svc = jasmine.createSpyObj("ProjectService", [
    "findById",
    "getGanttData",
    "findActivities",
    "findRisks",
  ]);
  svc.findById.and.returnValue(of({ success: true, data: MOCK_PROJECT }));
  svc.getGanttData.and.returnValue(of({ success: true, data: ganttData }));
  svc.findActivities.and.returnValue(of({ success: true, data: [] }));
  svc.findRisks.and.returnValue(of({ success: true, data: [] }));
  return svc;
}

describe("ProjectDetailComponent – Gantt", () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let mockService: jasmine.SpyObj<ProjectService>;

  beforeEach(async () => {
    mockService = buildMockService();

    spyOn(gantt, "init").and.callFake(() => {});
    spyOn(gantt, "clearAll").and.callFake(() => {});
    spyOn(gantt, "parse").and.callFake(() => {});

    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ProjectService, useValue: mockService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => "42" } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should call gantt.init with the native container element", () => {
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector(".gantt-container");
    expect(gantt.init).toHaveBeenCalledWith(el);
  });

  it("should parse gantt data that arrived before ngAfterViewInit", () => {
    // getGanttData fires synchronously (of()), so pendingGanttData is set
    // before ngAfterViewInit — detectChanges triggers ngAfterViewInit
    fixture.detectChanges();

    expect(gantt.parse).toHaveBeenCalledWith(MOCK_GANTT);
    expect(component.pendingGanttData()).toBeNull();
  });

  it("should parse gantt data immediately when already initialized", () => {
    fixture.detectChanges(); // init happens here

    const newData: GanttData = { data: [], links: [] };
    component["service"] = {
      ...mockService,
      getGanttData: () => of({ success: true, data: newData }),
    } as any;

    (gantt.parse as jasmine.Spy).calls.reset();
    (gantt.clearAll as jasmine.Spy).calls.reset();

    component.onActivitySaved({} as any);
    expect(gantt.clearAll).toHaveBeenCalled();
    expect(gantt.parse).toHaveBeenCalledWith(newData);
  });

  it("should call gantt.clearAll on destroy", () => {
    fixture.detectChanges();
    fixture.destroy();

    expect(gantt.clearAll).toHaveBeenCalled();
  });

  it("should load project and display its name", () => {
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector("h1");
    expect(title?.textContent).toContain("Test Project");
  });

  it("should request data for the project id from the route", () => {
    fixture.detectChanges();

    expect(mockService.findById).toHaveBeenCalledWith(42);
    expect(mockService.getGanttData).toHaveBeenCalledWith(42);
    expect(mockService.findActivities).toHaveBeenCalledWith(42);
  });
});

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import authRouter from "./auth";
import tenantsRouter from "./tenants";
import leadsRouter from "./leads";
import quotesRouter from "./quotes";
import projectsRouter from "./projects";
import customersRouter from "./customers";
import contentRouter from "./content";
import blogRouter from "./blog";
import visualiserRouter from "./visualiser";
import contactRouter from "./contact";
import dashboardRouter from "./dashboard";
import publicRouter from "./public";
import usersRouter from "./users";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use("/auth", authRouter);
router.use(tenantsRouter);
router.use(leadsRouter);
router.use(quotesRouter);
router.use(projectsRouter);
router.use(customersRouter);
router.use(contentRouter);
router.use(blogRouter);
router.use(visualiserRouter);
router.use(contactRouter);
router.use(dashboardRouter);
router.use(publicRouter);
router.use(usersRouter);
router.use(settingsRouter);

export default router;

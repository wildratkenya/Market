import { Router, type IRouter } from "express";
import healthRouter from "./health";
import booksRouter from "./books";
import ordersRouter from "./orders";
import podcastsRouter from "./podcasts";
import subscribersRouter from "./subscribers";
import messagesRouter from "./messages";
import statsRouter from "./stats";
import adminRouter from "./admin";
import uploadRouter from "./upload";
import pagesRouter from "./pages";
import blogsRouter from "./blogs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(uploadRouter);
router.use(booksRouter);
router.use(ordersRouter);
router.use(podcastsRouter);
router.use(subscribersRouter);
router.use(messagesRouter);
router.use(statsRouter);
router.use(pagesRouter);
router.use(blogsRouter);

export default router;

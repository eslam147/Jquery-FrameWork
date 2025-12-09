@echo off
REM artisanJs.cmd - wrapper لـ node artisanJs
REM This file is in vendor/, so we need to go up one level to find artisanJs
cd /d %~dp0..
node artisanJs %*


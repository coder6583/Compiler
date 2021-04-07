#pragma once
#include "env.h"
#include "translate.h"

struct expty {Tr_exp exp; Ty_ty ty;};

struct expty expTy(Tr_exp exp, Ty_ty ty)
{
    struct expty e;
    e.exp = exp;
    e.ty = ty;
    return e;
}

struct expty transStm(S_table venv, S_table tenv, A_stm s);
struct expty transVar(S_table venv, S_table tenv, A_var v);
struct expty transExp(S_table venv, S_table tenv, A_exp e);
void         transDec(S_table venv, S_table tenv, A_dec d);
Ty_ty        transTy (              S_table tenv, A_ty  ty);

void SEM_transProg(A_decList declist);